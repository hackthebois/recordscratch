import NotFoundScreen from "@/app/+not-found";
import StatBlock from "@/components/CoreComponents/StatBlock";
import DistributionChart from "@/components/DistributionChart";
import { FollowButton } from "@/components/Followers/FollowButton";
import ListOfLists from "@/components/List/ListOfLists";
import { UserAvatar } from "@/components/UserAvatar";
import { WebWrapper } from "@/components/WebWrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/auth";
import { ChevronRight, Hand, UserCheck } from "@/lib/icons/IconsLoader";
import { Settings } from "@/lib/icons/IconsLoader";
import { getImageUrl } from "@/lib/image";
import { ListWithResources, ListsType } from "@/types";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ShieldCheck, UserX } from "lucide-react-native";
import { Suspense, useState } from "react";
import {
	Platform,
	Pressable,
	ScrollView,
	View,
	useWindowDimensions,
} from "react-native";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib";
import { TopListTab } from "@/components/List/TopList";

import { useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Page } from "@/components/Page";

const ToggleAccountStatus = ({
	isActive,
	userId,
}: {
	isActive: boolean;
	userId: string;
}) => {
	const [open, setOpen] = useState(false);

	const { mutate: deactivateProfile } = useMutation(
		api.profiles.deactivate.mutationOptions(),
	);
	const { mutate: activateProfile } = useMutation(
		api.profiles.activate.mutationOptions(),
	);

	return (
		<Dialog open={open}>
			<DialogTrigger>
				<Button
					variant={isActive ? "destructive" : "secondary"}
					className={cn(isActive ? "bg-red-300" : "bg-green-300")}
					style={{ height: 30 }}
					onPress={() => setOpen(true)}
				>
					{isActive ? (
						<UserX size={15} className="color-black" />
					) : (
						<UserCheck size={15} className="color-black" />
					)}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-450px">
				<DialogTitle>
					{isActive ? "Deactivate Account" : "Reactivate Account"}
				</DialogTitle>
				<DialogDescription>
					{isActive
						? "Do you want to deactivate this account for violating terms of service?"
						: "Do you want to reactivate this account?"}
				</DialogDescription>
				<View className="mt-4 flex flex-row items-center justify-center gap-3">
					<DialogClose>
						<Button
							variant={isActive ? "destructive" : "secondary"}
							onPress={() => {
								if (isActive) {
									deactivateProfile({ userId });
								} else {
									activateProfile({ userId });
								}
								setOpen(false);
							}}
						>
							<Text>
								{isActive ? "Deactivate" : "Reactivate"}
							</Text>
						</Button>
					</DialogClose>
					<DialogClose>
						<Button
							variant="outline"
							onPress={() => setOpen(false)}
						>
							<Text>Cancel</Text>
						</Button>
					</DialogClose>
				</View>
			</DialogContent>
		</Dialog>
	);
};

const ListsTab = ({
	handle,
	lists,
	isProfile,
}: {
	handle: string;
	lists: ListsType[];
	isProfile: boolean;
}) => {
	const dimensions = useWindowDimensions();
	const screenSize = Math.min(dimensions.width, 1024);
	const numColumns = screenSize === 1024 ? 6 : 3;
	const top6Width =
		(Math.min(screenSize, 1024) - 32 - (numColumns - 1) * 16) / numColumns;

	return (
		<View className="px-2">
			<Link href={{ pathname: `/[handle]/lists`, params: { handle } }}>
				<View className="flex w-full flex-row items-center p-2">
					<Text variant="h3">
						{isProfile ? "My" : `${handle}'s`} Lists
					</Text>
					<ChevronRight
						size={30}
						className="color-muted-foreground"
					/>
				</View>
			</Link>

			<ListOfLists
				lists={lists}
				orientation="horizontal"
				size={top6Width}
			/>
		</View>
	);
};

const topListTabs = ["ALBUM", "SONG", "ARTIST"];

export const ProfilePage = ({ handle: customHandle }: { handle?: string }) => {
	const router = useRouter();
	const userProfile = useAuth((s) => s.profile);
	const params = useLocalSearchParams<{ handle: string; tab?: string }>();
	const handle = params.handle ?? customHandle;
	const tab = params.tab
		? topListTabs.includes(params.tab)
			? params.tab
			: "ALBUM"
		: "ALBUM";

	const { data: profile } = useSuspenseQuery(
		api.profiles.get.queryOptions(handle),
	);

	if (!profile) return <NotFoundScreen />;

	const isProfile = profile.userId === userProfile?.userId;

	const { data: lists } = useSuspenseQuery(
		api.lists.getUser.queryOptions({
			userId: profile.userId,
		}),
	);

	const { data: values } = useQuery(
		api.profiles.distribution.queryOptions({
			userId: profile.userId,
		}),
	);

	const { data: topLists } = useSuspenseQuery(
		api.lists.topLists.queryOptions({
			userId: profile.userId,
		}),
	);

	//const { mutate: deactivateProfile } = api.profiles.deactivate.useMutation();

	//const deactivateButton = () => {
	//	deactivateProfile({ userId: profile!.userId });
	//};

	const options =
		Platform.OS !== "web"
			? {
					title: profile.name,
					headerRight: () =>
						isProfile ? (
							<Link href={`/settings`} className="p-2">
								<Settings
									size={22}
									className="text-foreground"
								/>
							</Link>
						) : (
							<Suspense fallback={null}>
								<FollowButton
									profileId={profile!.userId}
									size={"sm"}
								/>
							</Suspense>
						),
				}
			: {};
	if (profile.deactivated && userProfile?.role !== "MOD") {
		return (
			<View className="mx-4 flex-1 items-center justify-center gap-16">
				<Hand size={100} color="red" fillOpacity={0} />
				<Text variant="h2" className="text-center">
					This account has been deactivated for violating our terms of
					service.
				</Text>
			</View>
		);
	}

	return (
		<Page options={options}>
			<ScrollView>
				<WebWrapper>
					<View className="mt-4 gap-2 px-4">
						<View className="flex flex-col justify-start">
							<View className="flex flex-col items-center gap-4 sm:items-start">
								<View className="flex-row gap-4">
									<View className="hidden sm:flex">
										<UserAvatar
											imageUrl={getImageUrl(profile)}
											size={144}
										/>
									</View>
									<View className="flex sm:hidden">
										<UserAvatar
											imageUrl={getImageUrl(profile)}
											size={100}
										/>
									</View>
									<View className="flex-1 items-start justify-center gap-3">
										<View className="flex flex-row items-center gap-2">
											<Text className="text-muted-foreground">
												PROFILE
											</Text>
											{userProfile?.role === "MOD" &&
												!isProfile && (
													<ToggleAccountStatus
														isActive={
															!profile.deactivated
														}
														userId={profile.userId}
													/>
												)}
										</View>

										<Text
											className="hidden sm:block"
											variant="h1"
										>
											{profile.name}
										</Text>
										<View className="flex flex-row flex-wrap items-center gap-3">
											<Badge>
												<Text>
													{`@${profile.handle}`}
												</Text>
											</Badge>
											<Badge>
												<Text>
													{`Streak: ${profile.meta.streak ?? ""}`}
												</Text>
											</Badge>
											<Badge>
												<Text>
													{`Likes: ${profile.meta.totalLikes ?? ""}`}
												</Text>
											</Badge>
											{profile.role === "MOD" && (
												<Badge className="bg-red-300">
													<View className="flex flex-row items-center">
														<ShieldCheck
															size={16}
															className="color-foreground"
														/>
														<Text>Moderator</Text>
													</View>
												</Badge>
											)}
										</View>
										<Text className="truncate text-wrap">
											{profile.bio || "No bio yet"}
										</Text>
										{Platform.OS === "web" ? (
											<>
												{isProfile ? (
													<Link
														href={`/settings`}
														asChild
													>
														<Button
															variant="secondary"
															className="flex-row items-center"
														>
															<Settings
																size={16}
																className="text-foreground mr-2"
															/>
															<Text>
																Settings
															</Text>
														</Button>
													</Link>
												) : (
													<Suspense fallback={null}>
														<FollowButton
															profileId={
																profile!.userId
															}
															size={"sm"}
														/>
													</Suspense>
												)}
											</>
										) : null}
									</View>
								</View>
								<View className="flex w-full flex-col items-center sm:items-start">
									<View className="flex w-full flex-row gap-2">
										<Link
											href={`/${profile.handle}/ratings`}
											asChild
										>
											<Pressable className="flex-1">
												<StatBlock
													title={"Ratings"}
													description={String(
														profile.meta
															.totalRatings,
													)}
													size="sm"
												/>
											</Pressable>
										</Link>
										<Link
											href={`/${profile.handle}/followers`}
											asChild
										>
											<Pressable className="flex-1">
												<StatBlock
													title={"Followers"}
													description={String(
														profile.meta
															.totalFollowers,
													)}
													size="sm"
												/>
											</Pressable>
										</Link>
										<Link
											href={`/${profile.handle}/followers?type=following`}
											asChild
										>
											<Pressable className="flex-1">
												<StatBlock
													title={"Following"}
													description={String(
														profile.meta
															.totalFollowing,
													)}
													size="sm"
												/>
											</Pressable>
										</Link>
									</View>
								</View>
							</View>
						</View>
						<View className="border-border max-w-112.5 rounded-xl border px-2 pt-3">
							<DistributionChart
								distribution={values}
								height={Platform.OS === "web" ? 100 : 80}
								onChange={(value) => {
									router.push({
										pathname: "/[handle]/ratings",
										params: {
											handle: profile!.handle,
											rating: value
												? String(value)
												: undefined,
										},
									});
								}}
							/>
						</View>
					</View>
					{/*<View className="px-4">
						<TopListTab
							isUser={isProfile}
							tab={tab}
							album={
								topLists.album as ListWithResources | undefined
							}
							song={
								topLists.song as ListWithResources | undefined
							}
							artist={
								topLists.artist as ListWithResources | undefined
							}
						/>
					</View>
					<ListsTab
						handle={profile.handle}
						lists={lists as ListsType[]}
						isProfile={isProfile}
					/>*/}
				</WebWrapper>
			</ScrollView>
		</Page>
	);
};

export default ProfilePage;
