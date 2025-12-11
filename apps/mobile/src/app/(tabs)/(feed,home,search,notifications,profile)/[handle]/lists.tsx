import NotFoundScreen from "@/app/+not-found";
import ListOfLists from "@/components/List/ListOfLists";
import { Button } from "@/components/ui/button";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { Platform, View, useWindowDimensions } from "react-native";
import { Text } from "@/components/ui/text";
import { Plus } from "@/lib/icons/IconsLoader";
import { useAuth } from "@/lib/auth";
import { ListsType } from "@recordscratch/types";

import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const CreateListButton = ({ isProfile }: { isProfile: boolean }) => {
	return (
		isProfile && (
			<Link asChild href="/(modals)/list/create">
				<Button variant="outline" className="flex-row items-center gap-2">
					<Plus className="text-foreground" size={18} />
					<Text>Create A List</Text>
				</Button>
			</Link>
		)
	);
};

const AllListsPage = () => {
	const { handle } = useLocalSearchParams<{ handle: string }>();

	const { data: profile } = useSuspenseQuery(api.profiles.get.queryOptions(handle));
	const userProfile = useAuth((s) => s.profile);
	const isProfile = profile?.userId == userProfile?.userId;
	const dimensions = useWindowDimensions();
	const screenSize = Math.min(dimensions.width, 1024);
	const numColumns = screenSize === 1024 ? 6 : 3;
	const top6Width = (Math.min(screenSize, 1024) - 32 - (numColumns - 1) * 16) / numColumns - 1;

	if (!profile) return <NotFoundScreen />;

	const { data: lists } = useSuspenseQuery(
		api.lists.getUser.queryOptions({
			userId: profile.userId,
		})
	);

	return (
		<>
			<Stack.Screen
				options={{
					title: `${isProfile ? "My" : `${profile.handle}'s`} Lists`,
				}}
			/>
			<ListOfLists
				HeaderComponent={
					Platform.OS != "web" ? (
						<View className="pb-4">
							<CreateListButton isProfile={isProfile} />
						</View>
					) : (
						<Text
							variant="h2"
							className="pb-4">{`${isProfile ? "My" : `${profile.handle}'s`} Lists`}</Text>
					)
				}
				numColumns={numColumns}
				lists={lists as ListsType[]}
				orientation="vertical"
				size={top6Width}
			/>
		</>
	);
};

export default AllListsPage;
