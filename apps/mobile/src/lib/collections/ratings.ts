import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { client, queryClient } from "@/components/Providers";
import * as SecureStore from "expo-secure-store";

console.log(crypto.randomUUID());

export const ratingCollection = createCollection(
	queryCollectionOptions({
		queryKey: ["ratings"],
		queryClient,
		queryFn: async () => {
			const sessionId = await SecureStore.getItemAsync("sessionId");
			const res = await client.api.ratings.$get(undefined, {
				headers: {
					Authorization: `${sessionId}`,
				},
			});
			return await res.json();
		},
		getKey: (item) => item.resourceId,
		onUpdate: async ({ transaction }) => {
			const { original, modified } = transaction.mutations[0];
			const sessionId = await SecureStore.getItemAsync("sessionId");
			await client.api.ratings.$post(
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
			await client.api.ratings.$delete(
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
