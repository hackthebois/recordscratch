import NotFoundScreen from "@/app/+not-found";
import { ProfileItem } from "@/components/Item/ProfileItem";
import { WebWrapper } from "@/components/WebWrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { api } from "@/components/Providers";
import { useAuth } from "@/lib/auth";
import { useRefreshByUser } from "@/lib/refresh";
import { FlashList } from "@shopify/flash-list";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Profile } from "@recordscratch/types";

const types = ["followers", "following"];

const Followers = () => {
	const router = useRouter();
	const { handle, ...params } = useLocalSearchParams<{
		handle: string;
		type?: string;
	}>();
	const type = (params.type && types.includes(params.type) ? params.type : "followers") as
		| "followers"
		| "following";

	const profile = useAuth((s) => s.profile);

	const [userProfile] = api.profiles.get.useSuspenseQuery(handle);

	if (!userProfile) return <NotFoundScreen />;

	const { data: followProfiles, refetch } = api.profiles.followProfiles.useQuery({
		profileId: userProfile.userId,
		type,
	});

	const { refetchByUser, isRefetchingByUser } = useRefreshByUser(refetch);

	return (
		<>
			<Stack.Screen
				options={{
					title: type === "followers" ? "Followers" : "Following",
				}}
			/>
			<Tabs
				value={type}
				onValueChange={(value) =>
					router.setParams({
						type: value === "followers" ? undefined : value,
					})
				}
				className="flex-1 sm:mt-4">
				<WebWrapper>
					<View className="w-full px-4">
						<TabsList className="flex-row">
							<TabsTrigger value="followers" className="flex-1">
								<Text>Followers</Text>
							</TabsTrigger>
							<TabsTrigger value="following" className="flex-1">
								<Text>Following</Text>
							</TabsTrigger>
						</TabsList>
					</View>
				</WebWrapper>
				<FlashList
					data={followProfiles?.flatMap((item) => item?.profile as Profile)}
					renderItem={({ item }) => (
						<WebWrapper>
							{item && (
								<ProfileItem
									profile={item}
									isUser={profile!.userId === item.userId}
								/>
							)}
						</WebWrapper>
					)}
					ItemSeparatorComponent={() => <View className="h-3" />}
					className="px-4"
					contentContainerClassName="py-4"
					refreshing={isRefetchingByUser}
					onRefresh={refetchByUser}
				/>
			</Tabs>
		</>
	);
};

export default Followers;
