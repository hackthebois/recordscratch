import NotFoundScreen from "@/app/+not-found";
import { ProfileItem } from "@/components/Item/ProfileItem";
import { WebWrapper } from "@/components/WebWrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/auth";
import { useRefreshByUser } from "@/lib/refresh";
import { FlashList } from "@shopify/flash-list";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Profile } from "@/types";

import { useQuery } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Page } from "@/components/Page";

const types = ["followers", "following"];

const Followers = () => {
	const router = useRouter();
	const { handle, ...params } = useLocalSearchParams<{
		handle: string;
		type?: string;
	}>();
	const type = (
		params.type && types.includes(params.type) ? params.type : "followers"
	) as "followers" | "following";

	const profile = useAuth((s) => s.profile);

	const { data: userProfile } = useSuspenseQuery(
		api.profiles.get.queryOptions(handle),
	);

	if (!userProfile) return <NotFoundScreen />;

	const { data: followProfiles, refetch } = useQuery(
		api.profiles.followProfiles.queryOptions({
			profileId: userProfile.userId,
			type,
		}),
	);

	const { refetchByUser, isRefetchingByUser } = useRefreshByUser(refetch);

	return (
		<Page title={type === "followers" ? "Followers" : "Following"}>
			<Tabs
				value={type}
				onValueChange={(value) =>
					router.setParams({
						type: value === "followers" ? undefined : value,
					})
				}
				className="flex-1 sm:mt-4"
			>
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
					<FlashList
						data={followProfiles?.flatMap(
							(item) => item?.profile as Profile,
						)}
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
				</WebWrapper>
			</Tabs>
		</Page>
	);
};

export default Followers;
