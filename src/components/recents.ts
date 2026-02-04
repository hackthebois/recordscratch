import { Album, Artist, Track } from "@/lib";
import type { Profile } from "@/types";
import { createStore } from "zustand";

export type Recent =
	| {
			id: string;
			type: "ALBUM";
			data: Album;
	  }
	| {
			id: string;
			type: "ARTIST";
			data: Artist;
	  }
	| {
			id: string;
			type: "SONG";
			data: Track & { album: Album };
	  }
	| {
			id: string;
			type: "PROFILE";
			data: Profile;
	  };

type RecentStore = {
	recents: Recent[];
	addRecent: (recent: Recent) => void;
};

const useRecentStore = createStore<RecentStore>((set, get) => ({
	recents: [],
	addRecent: (recent: Recent) => {
		set({
			recents: [
				recent,
				...get()
					.recents.filter(({ id }) => id !== recent.id)
					.slice(0, 4),
			],
		});
	},
}));
