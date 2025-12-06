import { api } from "@/components/Providers";
import { useAuth } from "@/lib/auth";
import { View, useWindowDimensions } from "react-native";
import ListOfList from "@/components/List/ListOfLists";
import { Link, useLocalSearchParams } from "expo-router";
import { Category } from "@recordscratch/types";
import { Button } from "@/components/ui/button";
import { SquarePlus } from "@/lib/icons/IconsLoader";
import { Text } from "@/components/ui/text";

const AddToListModal = () => {
	const { resourceId, parentId, category } = useLocalSearchParams<{
		resourceId: string;
		parentId?: string;
		category: string;
	}>();
	if (!resourceId || !(category as Category)) return null;
	const profile = useAuth((s) => s.profile);
	const [lists] = api.lists.getUser.useSuspenseQuery({
		userId: profile!.userId,
		category: category as Category,
	});

	const utils = api.useUtils();
	const { mutate } = api.lists.resources.create.useMutation({
		onSettled: (_data, _error, variables) => {
			if (variables) {
				utils.lists.resources.get.invalidate({
					listId: variables.listId,
				});
			}
			utils.lists.getUser.invalidate({
				userId: profile!.userId,
				category: category as Category,
			});
		},
	});

	const dimensions = useWindowDimensions();

	return (
		<View className="flex flex-1 pb-20">
			<ListOfList
				lists={lists}
				orientation="vertical"
				onPress={(listId: string) => {
					mutate({
						resourceId,
						parentId,
						listId,
					});
				}}
				showLink={false}
				size={dimensions.width / 3.25}
				LastItemComponent={
					<>
						<Link
							asChild
							href={{
								pathname: "/(modals)/list/createList",
								params: { categoryProp: category },
							}}>
							<Button
								variant="outline"
								className="flex flex-col items-center justify-center gap-1 rounded-2xl"
								style={{
									width: dimensions.width / 3.25,
									height: dimensions.width / 3.25,
									maxHeight: dimensions.width / 3.25,
									maxWidth: dimensions.width / 3.25,
								}}>
								<SquarePlus className="mt-6" />
								<Text className="text-center">Create a List</Text>
							</Button>
						</Link>
						{!lists?.length && (
							<View className="mt-40 w-full items-center justify-center">
								<Text variant="h3" className="capitalize text-muted-foreground">
									Make sure to create a list first
								</Text>
							</View>
						)}
					</>
				}
			/>
		</View>
	);
};

export default AddToListModal;
