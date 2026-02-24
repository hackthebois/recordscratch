import { ArtistItem } from "@/components/Item/ArtistItem";
import { ResourceItem } from "@/components/Item/ResourceItem";
import { Category, ListItem } from "@/types";
import {
	Gesture,
	GestureDetector,
	GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
	cancelAnimation,
	SharedValue,
	useAnimatedReaction,
	useAnimatedRef,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlignJustify, Trash2 } from "@/lib/icons/IconsLoader";
import ReText from "@/components/ui/retext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useColorScheme } from "@/lib/useColorScheme";
import * as Haptics from "expo-haptics";
import color from "color";
import { View, Platform } from "react-native";
import { WebWrapper } from "@/components/WebWrapper";
import { Text } from "@/components/ui/text";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Page } from "@/components/Page";
import { useHeaderRight } from "@/lib/navigation";

const SONG_HEIGHT = 70;
const MARGIN_TOP_OFFSET = 20;

function clamp(value: number, lowerBound: number, upperBound: number) {
	"worklet";
	return Math.max(lowerBound, Math.min(value, upperBound));
}
function objectMove(
	positions: Record<string, number>,
	from: number,
	to: number,
) {
	"worklet";
	const newPositions: Record<string, number> = { ...positions };
	for (const id in positions) {
		if (positions[id] === from) {
			newPositions[id] = to;
		} else if (positions[id] === to) {
			newPositions[id] = from;
		}
	}
	return newPositions;
}

function setMap(resources: ListItem[]) {
	"worklet";
	return resources.reduce<Record<string, number>>(
		(map: { [resourceId: string]: number }, obj: ListItem) => {
			map[obj.resourceId] = obj.position;
			return map;
		},
		{},
	);
}

function getUpdatedResources(
	resources: ListItem[],
	resourceId: string,
	positions: Record<string, number>,
) {
	const updatedResources: ListItem[] = [];
	let deletedResource: ListItem | null = null;

	for (const resource of resources) {
		if (resource.resourceId === resourceId) {
			deletedResource = resource;
		} else {
			updatedResources.push({
				...resource,
				position:
					positions[resource.resourceId] >= positions[resourceId]
						? positions[resource.resourceId] - 1 // Adjust positions
						: positions[resource.resourceId],
			});
		}
	}

	return { updatedResources, deletedResource };
}

const Resource = ({
	resourceId,
	parentId,
	category,
}: {
	resourceId: string;
	parentId?: string | null;
	category: Category;
}) => {
	if (category === "ARTIST")
		return (
			<ArtistItem
				artistId={resourceId}
				imageWidthAndHeight={SONG_HEIGHT - 5}
				textClassName="font-medium w-52"
				showLink={false}
			/>
		);
	return (
		<ResourceItem
			resource={{
				parentId: parentId!,
				resourceId,
				category,
			}}
			imageWidthAndHeight={SONG_HEIGHT - 5}
			textClassName="font-medium w-52"
			showArtist={false}
			showLink={false}
		/>
	);
};

const AnimatedResource = ({
	item,
	category,
	scrollY,
	resourcesSharedMap,
	resourcesCount,
	hasListChanged,
	deleteResource,
	contentHeight,
}: {
	item: ListItem;
	category: Category;
	scrollY: SharedValue<number>;
	resourcesSharedMap: SharedValue<Record<string, number>>;
	resourcesCount: number;
	hasListChanged: SharedValue<boolean>;
	deleteResource: (resourceId: string) => void;
	contentHeight: number;
}) => {
	const moving = useSharedValue<boolean>(false);
	const position = useSharedValue<string>(
		resourcesSharedMap.value[item.resourceId].toString(),
	);
	const top = useSharedValue<number>(
		(resourcesSharedMap.value[item.resourceId] - 1) * SONG_HEIGHT +
			MARGIN_TOP_OFFSET,
	);
	const { colorScheme } = useColorScheme();
	const backgroundColor = color("hsl(240, 10%, 3.9%)").rgb().string();

	useAnimatedReaction(
		() => resourcesSharedMap.value[item.resourceId],
		(currentPosition, previousPosition) => {
			if (currentPosition && currentPosition !== previousPosition)
				if (!moving.value) {
					top.value = withSpring(
						(currentPosition - 1) * SONG_HEIGHT + MARGIN_TOP_OFFSET,
					);
					position.value = currentPosition.toString();
				}
		},
		[moving],
	);

	const panHandler = Gesture.Pan()
		.runOnJS(true)
		.onStart(() => {
			moving.value = true;
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		})
		.onUpdate((event) => {
			const positionY = event.absoluteY + scrollY.value;

			top.value = withTiming(
				clamp(
					positionY - SONG_HEIGHT * 2,
					0,
					contentHeight - SONG_HEIGHT,
				), // modal causes song_height offset
				{
					duration: 16,
				},
			);

			const newPosition = clamp(
				Math.floor((positionY - MARGIN_TOP_OFFSET) / SONG_HEIGHT),
				1,
				resourcesCount,
			);

			if (newPosition !== resourcesSharedMap.value[item.resourceId]) {
				resourcesSharedMap.value = objectMove(
					resourcesSharedMap.value,
					resourcesSharedMap.value[item.resourceId],
					newPosition,
				);
				position.value = newPosition.toString();
				hasListChanged.value = true;
			}
		})
		.onEnd(() => {
			top.value = withSpring(
				(resourcesSharedMap.value[item.resourceId] - 1) * SONG_HEIGHT +
					MARGIN_TOP_OFFSET,
			);
			moving.value = false;
		})
		.hitSlop({ right: 0, width: 60 });

	const animatedStyle = useAnimatedStyle(
		() => ({
			position: "absolute",
			top: top.value,
			shadowColor: colorScheme === "light" ? "white" : "black",
			zIndex: moving.value ? 1 : 0,
			backgroundColor: moving.value
				? colorScheme === "light"
					? "white"
					: backgroundColor
				: "transparent",
			borderRadius: 10,
			shadowOffset: {
				height: 0,
				width: 0,
			},
			shadowOpacity: withSpring(moving ? 0.2 : 0),
			shadowRadius: 10,
			flexDirection: "row",
			alignItems: "center",
			width: "100%",
			gap: 16,
			visibility: "false",
		}),
		[moving],
	);

	return (
		<GestureDetector gesture={panHandler}>
			<Animated.View style={animatedStyle}>
				<ReText
					text={position}
					style={{
						paddingLeft: 16,
						color: colorScheme ? "#6b7280" : "white",
						fontWeight: "bold",
					}}
				/>
				<View className="flex-1">
					<Resource
						resourceId={item.resourceId}
						parentId={item.parentId}
						category={category}
					/>
				</View>
				<Button
					className="size-9"
					onPress={() => {
						cancelAnimation(top);
						deleteResource(item.resourceId);
					}}
					variant="secondary"
					size="icon"
				>
					<Trash2 size={18} className="text-foreground" />
				</Button>
				<AlignJustify
					className="text-foreground"
					style={{ marginRight: 16 }}
				/>
			</Animated.View>
		</GestureDetector>
	);
};

const SortableList = ({
	resourcesState,
	setResourcesState,
	resourcesSharedMap,
	hasListChanged,
	deletedResources,
	setDeletedResources,
	category,
}: {
	resourcesState: ListItem[];
	setResourcesState: (resources: ListItem[]) => void;
	resourcesSharedMap: SharedValue<Record<string, number>>;
	hasListChanged: SharedValue<boolean>;
	deletedResources: ListItem[];
	setDeletedResources: (deletedResources: ListItem[]) => void;
	category: Category;
}) => {
	const scrollY = useSharedValue(0);
	const scrollViewRef = useAnimatedRef<Animated.ScrollView>();
	const contentHeight =
		resourcesState.length * SONG_HEIGHT + MARGIN_TOP_OFFSET * 2;

	const handleScroll = useAnimatedScrollHandler((event) => {
		scrollY.value = event.contentOffset.y;
	});

	const deleteResource = (resourceId: string) => {
		hasListChanged.value = true;
		const { updatedResources, deletedResource } = getUpdatedResources(
			resourcesState,
			resourceId,
			resourcesSharedMap.value,
		);
		setResourcesState(updatedResources);
		setDeletedResources([...deletedResources, deletedResource!]);
	};

	return (
		<Animated.ScrollView
			ref={scrollViewRef}
			onScroll={handleScroll}
			scrollEventThrottle={16}
			nestedScrollEnabled={true}
			style={{ flex: 1, position: "relative" }}
			contentContainerStyle={{ height: contentHeight }}
			showsVerticalScrollIndicator={false}
		>
			{resourcesState.map((item) => (
				<AnimatedResource
					key={item.resourceId}
					item={item}
					category={category}
					deleteResource={deleteResource}
					resourcesSharedMap={resourcesSharedMap}
					resourcesCount={resourcesState.length}
					hasListChanged={hasListChanged}
					scrollY={scrollY}
					contentHeight={contentHeight}
				/>
			))}
		</Animated.ScrollView>
	);
};

const RearrangeListModal = () => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { listId } = useLocalSearchParams<{ listId: string }>();
	const { data: list } = useSuspenseQuery(
		api.lists.get.queryOptions({ id: listId }),
	);
	const { data: listItems } = useSuspenseQuery(
		api.lists.resources.get.queryOptions({
			listId,
			userId: list!.userId,
		}),
	);

	const [resourcesState, setResourcesState] = useState<ListItem[]>(
		listItems as ListItem[],
	);
	const [deletedResources, setDeletedResources] = useState<ListItem[]>([]);
	const hasListChanged = useSharedValue<boolean>(false);
	const resourcesSharedMap = useDerivedValue(
		() => setMap(resourcesState),
		[resourcesState],
	);

	const { mutateAsync: updatePositions } = useMutation(
		api.lists.resources.updatePositions.mutationOptions(),
	);
	const { mutateAsync: deletePositions } = useMutation(
		api.lists.resources.multipleDelete.mutationOptions(),
	);

	const handleSave = async () => {
		router.back();
		if (hasListChanged) {
			await updatePositions({
				listId,
				resources: resourcesState.map((resource) => ({
					...resource,
					position: resourcesSharedMap.value[resource.resourceId],
				})),
			});
		}
		if (deletedResources.length > 0) {
			await deletePositions({
				listId,
				resources: deletedResources,
			});
		}
		await Promise.all([
			queryClient.invalidateQueries(
				api.lists.resources.get.queryOptions({
					listId,
					userId: list?.profile.userId!,
				}),
			),
			queryClient.invalidateQueries(
				api.lists.getUser.queryOptions({
					userId: list?.userId!,
				}),
			),
			list?.onProfile &&
				queryClient.invalidateQueries(
					api.lists.topLists.queryOptions({
						userId: list?.userId,
					}),
				),
		]);
	};

	const headerRight = useHeaderRight({
		type: "button",
		label: "Save",
		onPress: handleSave,
	});

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<Page title={`Edit ${list?.name}`} options={headerRight}>
				{Platform.OS === "web" ? (
					<WebWrapper>
						<Text className="text-muted-foreground mt-40 text-center text-xl">
							Editing lists is not supported on the web yet.
							Please use the mobile app.
						</Text>
					</WebWrapper>
				) : (
					<SortableList
						resourcesState={resourcesState}
						setResourcesState={setResourcesState}
						resourcesSharedMap={resourcesSharedMap}
						category={list!.category}
						hasListChanged={hasListChanged}
						deletedResources={deletedResources}
						setDeletedResources={setDeletedResources}
					/>
				)}
			</Page>
		</GestureHandlerRootView>
	);
};
export default RearrangeListModal;
