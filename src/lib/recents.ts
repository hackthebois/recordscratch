import type { Profile } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Album, Artist, Track } from "./deezer";

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
	// eslint-disable-next-line no-unused-vars
	addRecent: (recent: Recent) => void;
};

export const useRecents = (type: "SEARCH") => {
	return create<RecentStore>()(
		persist(
			(set, get) => ({
				recents: [],
				addRecent: (recent: Recent) => {
					set({
						recents: [
							recent,
							...get()
								.recents.filter(({ id }) => id !== recent.id)
								.slice(0, 5),
						],
					});
				},
			}),
			{
				name: type,
			},
		),
	)();
};
