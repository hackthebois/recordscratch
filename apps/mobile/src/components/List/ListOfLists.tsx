import { ListsType } from "@recordscratch/types";
import { FlatList, Platform, Pressable, View } from "react-native";
import ListImage from "./ListImage";
import React from "react";
import { Text } from "../ui/text";
import { useRouter } from "expo-router";

const ListsItem = ({
	listsItem,
	size,
	onPress,
	showLink,
}: {
	listsItem: ListsType;
	size: number;
	onPress?: (listId: string) => void;
	showLink?: boolean;
}) => {
	const router = useRouter();
	if (!listsItem.id || !listsItem.profile) return null;
	const listResources = listsItem.resources;

	return (
		<View
			style={{
				width: size,
			}}>
			<Pressable
				onPress={() => {
					if (onPress) {
						onPress(listsItem.id);
					}
					if (showLink) router.push(`/lists/${listsItem.id}`);
				}}
				className="flex w-full flex-col">
				<View className="flex flex-col justify-center gap-4">
					<View
						style={{
							width: size,
							height: size,
							maxWidth: size,
							maxHeight: size,
						}}
						className="flex items-center justify-center">
						<ListImage
							listItems={listResources}
							category={listsItem.category}
							size={size}
						/>
					</View>
					<Text
						className={"w-full text-ellipsis font-semibold"}
						numberOfLines={1}
						style={{ flexWrap: "wrap" }}>
						{listsItem.name}
					</Text>
				</View>
			</Pressable>
		</View>
	);
};
const ListOfLists = ({
	size = 125,
	showLink = true,
	orientation,
	onPress,
	lists,
	numColumns,
	HeaderComponent,
	FooterComponent,
	LastItemComponent,
	EmptyComponent,
}: {
	size?: number;
	showLink?: boolean;
	orientation?: "vertical" | "horizontal";
	onPress?: (listId: string) => void;
	numColumns?: number;
	lists: ListsType[] | undefined;
	HeaderComponent?: React.ReactNode;
	FooterComponent?: React.ReactNode;
	LastItemComponent?: React.ReactNode;
	EmptyComponent?: React.ReactNode;
}) => {
	let listoflists;
	if (LastItemComponent) {
		const emptyList: ListsType = {
			id: "",
			userId: "",
			name: "",
			category: "ALBUM",
			resources: [],
			profile: null,
		};
		listoflists = [...(lists || []), emptyList];
	} else listoflists = lists;

	if (orientation === "vertical") {
		return (
			<FlatList
				ListHeaderComponent={() => HeaderComponent}
				ListFooterComponent={() => FooterComponent}
				ListEmptyComponent={() => EmptyComponent}
				data={listoflists}
				keyExtractor={(index) => index.id}
				renderItem={({ item }) => {
					if (item.id === "") return <>{LastItemComponent}</>;
					return (
						<ListsItem
							listsItem={item}
							size={size}
							onPress={onPress}
							showLink={showLink}
						/>
					);
				}}
				columnWrapperStyle={{
					flexDirection: "row",
					flexWrap: "wrap",
					marginBottom: 16,
					gap: 16,
				}}
				contentContainerStyle={{
					maxWidth: 1024,
					width: "100%",
					marginHorizontal: "auto",
					padding: 16,
				}}
				keyboardShouldPersistTaps="always"
				keyboardDismissMode="interactive"
				numColumns={numColumns || 3}
				scrollEnabled={true}
				horizontal={false}
				showsVerticalScrollIndicator={false}
			/>
		);
	}
	return (
		<FlatList
			data={lists}
			keyExtractor={(index) => index.id}
			renderItem={({ item }) => (
				<ListsItem listsItem={item} size={size} onPress={onPress} showLink={showLink} />
			)}
			contentContainerStyle={{
				flexDirection: "row",
				gap: 17,
				marginVertical: 16,
			}}
			style={{ marginLeft: -8 }}
			showsHorizontalScrollIndicator={Platform.OS === "web"}
			horizontal
			ListFooterComponent={() => FooterComponent}
			ListHeaderComponent={() => HeaderComponent}
		/>
	);
};

export default ListOfLists;
