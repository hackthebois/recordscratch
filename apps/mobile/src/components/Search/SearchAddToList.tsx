import Dialog from "@/components/CoreComponents/Dialog";
import { Search } from "@/lib/icons/IconsLoader";
import { useDebounce } from "@recordscratch/lib";
import { useState } from "react";
import { TextInput, View } from "react-native";
import MusicSearch from "./MusicSearch";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const SearchAddToList = ({
	category,
	listId,
	button,
	onPress,
	openMenu,
}: {
	category: "ALBUM" | "SONG" | "ARTIST";
	listId: string;
	button?: React.ReactNode;
	onPress?: () => void;
	openMenu?: boolean;
}) => {
	const [open, setOpen] = useState<boolean>(openMenu ?? false);
	const [query, setQuery] = useState("");
	const debouncedQuery = useDebounce(query, 500);
	const queryClient = useQueryClient();
	const profile = useAuth((s) => s.profile);

	const { mutate } = useMutation(
		api.lists.resources.create.mutationOptions({
			onSettled: async (_data, _error, variables) => {
				if (variables) {
					await queryClient.invalidateQueries(
						api.lists.resources.get.queryOptions({
							userId: profile!.userId,
							listId: variables.listId,
						})
					);
					if (onPress) onPress();
				}
			},
		})
	);

	const AddToList = ({
		resourceId,
		parentId,
	}: {
		resourceId: string;
		parentId: string | null | undefined;
	}) => {
		mutate({
			resourceId,
			parentId,
			listId,
		});
	};

	return (
		<Dialog
			open={open}
			setOpen={setOpen}
			onOpen={() => {
				if (!open) setQuery("");
			}}
			triggerOutline={button}
			contentClassName="mt-10"
			className="h-40">
			<View className="flex flex-row items-center border-b">
				<Search size={20} className="text-muted-foreground" />
				<TextInput
					id="name"
					autoComplete="off"
					placeholder="Search"
					value={query}
					className="w-full bg-transparent p-2 text-lg text-foreground outline-none"
					onChangeText={(text) => setQuery(text)}
				/>
			</View>
			<MusicSearch
				query={debouncedQuery}
				onNavigate={() => {
					setQuery("");
					setOpen(false);
				}}
				onPress={AddToList}
				hide={{
					albums: !(category === "ALBUM"),
					songs: !(category === "SONG"),
					artists: !(category === "ARTIST"),
				}}
				showLink={false}
			/>
		</Dialog>
	);
};

export default SearchAddToList;
