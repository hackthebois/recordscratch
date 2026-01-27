import { listResources, lists, ratings } from "@/server/db";
import {
	deleteListResourcesSchema,
	filterUserListsSchema,
	insertListResourcesSchema,
	insertListSchema,
	listOfResourcesSchema,
	selectListResourcesSchema,
	selectListSchema,
	updateListSchema,
} from "@/types";
import { and, asc, desc, eq } from "drizzle-orm/sql";
import { v4 as uuidv4 } from "uuid";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const listsRouter = router({
	get: publicProcedure.input(selectListSchema).query(async ({ ctx: { db }, input: { id } }) => {
		return (
			(await db.query.lists.findFirst({
				where: eq(lists.id, id),
				with: { profile: true },
			})) ?? null
		);
	}),

	getUser: publicProcedure
		.input(filterUserListsSchema)
		.query(async ({ ctx: { db }, input: { userId, category } }) => {
			let whereClause;
			if (category) whereClause = and(eq(lists.userId, userId), eq(lists.category, category));
			else whereClause = eq(lists.userId, userId);

			return await db.query.lists.findMany({
				with: {
					resources: {
						limit: 4,
						orderBy: [asc(listResources.position)],
					},
					profile: true,
				},
				where: whereClause,
				orderBy: [desc(lists.updatedAt)],
			});
		}),

	topLists: publicProcedure
		.input(filterUserListsSchema)
		.query(async ({ ctx: { db }, input: { userId } }) => {
			const artistList = await db.query.lists.findFirst({
				with: {
					resources: {
						limit: 6,
						orderBy: [asc(listResources.position)],
					},
				},
				where: and(
					eq(lists.userId, userId),
					eq(lists.category, "ARTIST"),
					eq(lists.onProfile, true)
				),
			});

			const albumList = await db.query.lists.findFirst({
				with: {
					resources: {
						limit: 6,
						orderBy: [asc(listResources.position)],
					},
				},
				where: and(
					eq(lists.userId, userId),
					eq(lists.category, "ALBUM"),
					eq(lists.onProfile, true)
				),
			});

			const songList = await db.query.lists.findFirst({
				with: {
					resources: {
						limit: 6,
						orderBy: [asc(listResources.position)],
					},
				},
				where: and(
					eq(lists.userId, userId),
					eq(lists.category, "SONG"),
					eq(lists.onProfile, true)
				),
			});

			return { artist: artistList, album: albumList, song: songList };
		}),

	create: protectedProcedure
		.input(insertListSchema)
		.mutation(async ({ ctx: { db, userId }, input: inputs }) => {
			const id = uuidv4();
			await db.insert(lists).values({ id, userId, ...inputs });
			return id;
		}),

	update: protectedProcedure
		.input(updateListSchema)
		.mutation(async ({ ctx: { db, userId }, input: { id, name, description, onProfile } }) => {
			const listExists = await db.query.lists.findFirst({
				where: and(eq(lists.id, id), eq(lists.userId, userId)),
			});

			if (listExists) {
				if (onProfile)
					await db
						.update(lists)
						.set({ onProfile: false })
						.where(
							and(eq(lists.userId, userId), eq(lists.category, listExists.category))
						);

				await db
					.update(lists)
					.set({ name, description, onProfile })
					.where(and(eq(lists.id, id), eq(lists.userId, userId)));
			} else throw new Error("List Doesn't exist");
		}),

	delete: protectedProcedure
		.input(selectListSchema)
		.mutation(async ({ ctx: { db, userId }, input: { id } }) => {
			const listExists: boolean = !!(await db.query.lists.findFirst({
				where: and(eq(lists.id, id), eq(lists.userId, userId)),
			}));

			if (listExists)
				await db.delete(lists).where(and(eq(lists.id, id), eq(lists.userId, userId)));
			else throw new Error("List Doesn't exist");
		}),

	resources: router({
		get: publicProcedure
			.input(selectListResourcesSchema)
			.query(async ({ ctx: { db }, input: { listId, userId } }) => {
				return await db
					.select({
						parentId: listResources.parentId,
						listId: listResources.listId,
						resourceId: listResources.resourceId,
						position: listResources.position,
						rating: ratings.rating,
					})
					.from(listResources)
					.leftJoin(
						ratings,
						and(
							eq(ratings.resourceId, listResources.resourceId),
							eq(ratings.userId, userId)
						)
					)
					.where(eq(listResources.listId, listId))
					.orderBy(listResources.position);
			}),

		create: protectedProcedure
			.input(insertListResourcesSchema)
			.mutation(async ({ ctx: { db, userId }, input: inputs }) => {
				const listOwner = !!(await db.query.lists.findFirst({
					where: and(eq(lists.userId, userId), eq(lists.id, inputs.listId)),
				}));
				const resourceExists = !!(await db.query.listResources.findFirst({
					where: and(
						eq(listResources.resourceId, inputs.resourceId),
						eq(listResources.listId, inputs.listId)
					),
				}));

				if (listOwner && !resourceExists) {
					const lastPosition =
						(
							await db.query.listResources.findFirst({
								where: eq(listResources.listId, inputs.listId),
								orderBy: [desc(listResources.position)],
							})
						)?.position ?? 0;

					await db
						.insert(listResources)
						.values({ ...inputs, position: lastPosition + 1 });

					await db
						.update(lists)
						.set({ updatedAt: new Date() })
						.where(eq(lists.id, inputs.listId));
				}
			}),

		updatePositions: protectedProcedure
			.input(listOfResourcesSchema)
			.mutation(async ({ ctx: { db, userId }, input: { listId, resources } }) => {
				const listOwner = !!(await db.query.lists.findFirst({
					where: and(eq(lists.userId, userId), eq(lists.id, listId)),
				}));
				if (!listOwner) throw new Error("List Doesn't exist");
				await db.update(lists).set({ updatedAt: new Date() }).where(eq(lists.id, listId));
				await Promise.all(
					resources.map((item) => {
						return db
							.update(listResources)
							.set({ position: item.position })
							.where(
								and(
									eq(listResources.resourceId, item.resourceId),
									eq(listResources.listId, item.listId)
								)
							);
					})
				);
			}),

		multipleDelete: protectedProcedure
			.input(listOfResourcesSchema)
			.mutation(async ({ ctx: { db, userId }, input: { listId, resources } }) => {
				const listOwner = !!(await db.query.lists.findFirst({
					where: and(eq(lists.userId, userId), eq(lists.id, listId)),
				}));

				if (listOwner) {
					await db
						.update(lists)
						.set({ updatedAt: new Date() })
						.where(eq(lists.id, listId));
					await Promise.all(
						resources.map((item) => {
							return db
								.delete(listResources)
								.where(
									and(
										eq(listResources.resourceId, item.resourceId),
										eq(listResources.listId, listId)
									)
								);
						})
					);
				}
			}),

		delete: protectedProcedure
			.input(deleteListResourcesSchema)
			.mutation(async ({ ctx: { db, userId }, input: { listId, resourceId } }) => {
				const listOwner = !!(await db.query.lists.findFirst({
					where: and(eq(lists.userId, userId), eq(lists.id, listId)),
				}));

				if (listOwner) {
					await db
						.update(lists)
						.set({ updatedAt: new Date() })
						.where(eq(lists.id, listId));

					await db
						.delete(listResources)
						.where(
							and(
								eq(listResources.resourceId, resourceId),
								eq(listResources.listId, listId)
							)
						);
				}
			}),
	}),
});
