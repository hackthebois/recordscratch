import NotFoundScreen from "@/app/+not-found";
import ListOfLists from "@/components/List/ListOfLists";
import { Button } from "@/components/ui/button";
import { api } from "@/components/Providers";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { Platform, View, useWindowDimensions } from "react-native";
import { Text } from "@/components/ui/text";
import { SquarePlus } from "@/lib/icons/IconsLoader";
import { useAuth } from "@/lib/auth";

const CreateListButton = ({ isProfile }: { isProfile: boolean }) => {
	return (
		isProfile && (
			<Link asChild href="/(modals)/list/createList">
				<Button variant="outline" className="my-2 flex flex-row items-center gap-3">
					<SquarePlus className="text-foreground" />
					<Text>Create A List</Text>
				</Button>
			</Link>
		)
	);
};

const AllListsPage = () => {
	const { handle } = useLocalSearchParams<{ handle: string }>();

	const [profile] = api.profiles.get.useSuspenseQuery(handle);
	const userProfile = useAuth((s) => s.profile);
	const isProfile = profile?.userId == userProfile?.userId;
	const dimensions = useWindowDimensions();
	const screenSize = Math.min(dimensions.width, 1024);
	const numColumns = screenSize === 1024 ? 6 : 3;
	const top6Width = (Math.min(screenSize, 1024) - 32 - (numColumns - 1) * 16) / numColumns - 1;

	if (!profile) return <NotFoundScreen />;

	const [lists] = api.lists.getUser.useSuspenseQuery({
		userId: profile.userId,
	});

	return (
		<>
			<Stack.Screen
				options={{
					title: `${isProfile ? "My" : `${profile.handle}'s`} Lists`,
				}}
			/>
			<ListOfLists
				HeaderComponent={
					Platform.OS !== "web" ? (
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
				lists={lists}
				orientation="vertical"
				size={top6Width}
			/>
		</>
	);
};

export default AllListsPage;
