import { Text } from "@/components/ui/text";
import { getImageUrl } from "@/lib/image";
import { Link } from "expo-router";
import { Platform, View, useWindowDimensions } from "react-native";
import { useAuth } from "@/lib/auth";
import { UserAvatar } from "@/components/UserAvatar";
import { Bell, Home, Rows3, Search } from "@/lib/icons/IconsLoader";

export const WebHeaderRight = () => {
	if (Platform.OS !== "web") return null;
	const profile = useAuth((s) => s.profile);
	if (!profile) return null;
	const { width } = useWindowDimensions();

	return (
		<View
			className="h-full flex-row items-center"
			style={{
				marginRight: width > 1024 ? (width - 1024) / 2 : 0,
			}}>
			<Link href="/" className="flex h-full items-center justify-center gap-2 px-2">
				<Home className="text-foreground" size={width > 768 ? 22 : 26} />
				<Text className="hidden sm:block">Home</Text>
			</Link>
			<Link href="/search" className="flex h-full items-center justify-center gap-2 px-2">
				<Search className="text-foreground" size={width > 768 ? 22 : 26} />
				<Text className="hidden sm:block">Search</Text>
			</Link>
			<Link href="/feed" className="flex h-full items-center justify-center gap-2 px-2">
				<Rows3 className="text-foreground" size={width > 768 ? 22 : 26} />
				<Text className="hidden sm:block">Feed</Text>
			</Link>
			<Link
				href="/notifications"
				className="flex h-full items-center justify-center gap-2 px-2">
				<Bell className="text-foreground" size={width > 768 ? 22 : 26} />
				<Text className="hidden sm:block">Notifications</Text>
			</Link>
			<Link href="/profile" className="flex h-full items-center justify-center gap-2 px-4">
				<UserAvatar imageUrl={getImageUrl(profile)} size={40} />
			</Link>
		</View>
	);
};
