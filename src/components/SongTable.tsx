import { Track, cn } from "@/lib";
import { Link } from "expo-router";
import { Pressable, View } from "react-native";
import RateButton from "./Rating/RateButton";
import { RatingInfo } from "./Rating/RatingInfo";
import { Text } from "./ui/text";

const SongTable = ({ songs }: { songs: Track[] }) => {
	return (
		<View>
			{songs.map((song, index) => (
				<Link
					key={index}
					href={`/albums/${String(song.album.id)}/songs/${String(song.id)}`}
					className={cn(
						"w-full",
						index != songs.length - 1 && "border-muted border-b-2",
					)}
					asChild
				>
					<Pressable className="flex flex-row items-center justify-between gap-6 px-4 py-2">
						<View className="flex max-w-52 flex-1 flex-row items-center gap-2 sm:max-w-full">
							<Text className="text-muted-foreground w-6 font-bold">
								{index + 1}
							</Text>
							<Text numberOfLines={1}>{song.title}</Text>
						</View>
						<View className="flex flex-row items-center gap-2">
							<RatingInfo
								resource={{
									resourceId: String(song.id),
									parentId: String(song.album.id),
									category: "SONG",
								}}
								size="sm"
							/>
							<RateButton
								imageUrl={song.album.cover_big}
								resource={{
									parentId: String(song.album.id),
									resourceId: String(song.id),
									category: "SONG",
								}}
								name={song.title}
								size="sm"
							/>
						</View>
					</Pressable>
				</Link>
			))}
		</View>
	);
};

export default SongTable;
