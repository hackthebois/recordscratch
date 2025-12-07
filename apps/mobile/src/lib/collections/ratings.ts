import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { client, queryClient } from "@/components/Providers";
import * as SecureStore from "expo-secure-store";

export const resourceRatingCollection = createCollection(
	queryCollectionOptions({
		queryKey: ["resource-ratings"],
		queryClient,
		queryFn: async () => {
			const sessionId = await SecureStore.getItemAsync("sessionId");
			const res = await client.api.resource.ratings.$get(undefined, {
				headers: {
					Authorization: `${sessionId}`,
				},
			});
			return await res.json();
		},
		getKey: (item) => item.resourceId,
	})
);

export const userRatingCollection = createCollection(
	queryCollectionOptions({
		queryKey: ["user-ratings"],
		queryClient,
		queryFn: async () => {
			const sessionId = await SecureStore.getItemAsync("sessionId");
			const res = await client.api.user.ratings.$get(undefined, {
				headers: {
					Authorization: `${sessionId}`,
				},
			});
			return await res.json();
		},
		getKey: (item) => item.resourceId,
		onInsert: async ({ transaction }) => {
			const { modified } = transaction.mutations[0];
			const sessionId = await SecureStore.getItemAsync("sessionId");
			await client.api.user.ratings.$post(
				{
					json: {
						parentId: modified.parentId,
						resourceId: modified.resourceId,
						category: modified.category,
						rating: modified.rating,
						content: modified.content,
					},
				},
				{
					headers: {
						Authorization: `${sessionId}`,
					},
				}
			);
		},
		onUpdate: async ({ transaction }) => {
			const { original, modified } = transaction.mutations[0];
			const sessionId = await SecureStore.getItemAsync("sessionId");
			await client.api.user.ratings.$post(
				{
					json: {
						parentId: original.parentId,
						resourceId: original.resourceId,
						category: original.category,
						rating: modified.rating,
						content: modified.content,
					},
				},
				{
					headers: {
						Authorization: `${sessionId}`,
					},
				}
			);
		},
		onDelete: async ({ transaction }) => {
			const { original } = transaction.mutations[0];
			const sessionId = await SecureStore.getItemAsync("sessionId");
			await client.api.user.ratings.$delete(
				{
					json: {
						parentId: original.parentId,
						resourceId: original.resourceId,
						category: original.category,
					},
				},
				{
					headers: {
						Authorization: `${sessionId}`,
					},
				}
			);
		},
	})
);
