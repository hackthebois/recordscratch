import dayjs from "dayjs";
import TimezonePlugin from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { publicProcedure, router } from "../trpc";

dayjs.extend(TimezonePlugin);
dayjs.extend(utc);

const albums: {
	albumId: string;
	date: dayjs.Dayjs;
}[] = [
	{
		albumId: "7898255",
		date: dayjs.tz("2025-02-06", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "254297",
		date: dayjs.tz("2025-02-07", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "104660202",
		date: dayjs.tz("2025-02-08", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "673968231",
		date: dayjs.tz("2025-02-09", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "162683632",
		date: dayjs.tz("2025-02-10", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "70982",
		date: dayjs.tz("2025-02-11", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "12047952",
		date: dayjs.tz("2025-02-12", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "12114240",
		date: dayjs.tz("2025-02-13", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "597350882",
		date: dayjs.tz("2025-02-14", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "96126",
		date: dayjs.tz("2025-02-15", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "11591214",
		date: dayjs.tz("2025-02-16", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "97140952",
		date: dayjs.tz("2025-02-17", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "11205422",
		date: dayjs.tz("2025-02-18", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "488063815",
		date: dayjs.tz("2025-02-19", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "6237061",
		date: dayjs.tz("2025-02-20", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "1252978",
		date: dayjs.tz("2025-02-21", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "1345731",
		date: dayjs.tz("2025-02-22", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "69804312",
		date: dayjs.tz("2025-02-23", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "340878",
		date: dayjs.tz("2025-02-24", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "1347738",
		date: dayjs.tz("2025-02-25", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "39560581",
		date: dayjs.tz("2025-02-26", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "653084",
		date: dayjs.tz("2025-02-27", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "6899610",
		date: dayjs.tz("2025-02-28", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "69352202",
		date: dayjs.tz("2025-03-01", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "6716152",
		date: dayjs.tz("2025-03-02", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "1261474",
		date: dayjs.tz("2025-03-03", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "624230681",
		date: dayjs.tz("2025-03-04", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "14880741",
		date: dayjs.tz("2025-03-05", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "463824335",
		date: dayjs.tz("2025-03-06", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "106054",
		date: dayjs.tz("2025-03-07", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "9908666",
		date: dayjs.tz("2025-03-08", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "12114242",
		date: dayjs.tz("2025-03-09", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "504180521",
		date: dayjs.tz("2025-03-10", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "448448585",
		date: dayjs.tz("2025-03-11", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "12047960",
		date: dayjs.tz("2025-03-12", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "9896728",
		date: dayjs.tz("2025-03-13", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "484372295",
		date: dayjs.tz("2025-03-14", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "1440807",
		date: dayjs.tz("2025-03-15", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "7820635",
		date: dayjs.tz("2025-03-16", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "44730061",
		date: dayjs.tz("2025-03-17", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "455130",
		date: dayjs.tz("2025-03-18", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "42886601",
		date: dayjs.tz("2025-03-19", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "231352",
		date: dayjs.tz("2025-03-20", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "6916355",
		date: dayjs.tz("2025-03-21", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "139385112",
		date: dayjs.tz("2025-03-22", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "400582",
		date: dayjs.tz("2025-03-23", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "632126401",
		date: dayjs.tz("2025-03-24", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "11336428",
		date: dayjs.tz("2025-03-25", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "348380787",
		date: dayjs.tz("2025-03-26", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "64182182",
		date: dayjs.tz("2025-03-27", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "139890932",
		date: dayjs.tz("2025-03-28", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "1329897",
		date: dayjs.tz("2025-03-29", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "1602407",
		date: dayjs.tz("2025-03-30", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "280445562",
		date: dayjs.tz("2025-03-31", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "423868847",
		date: dayjs.tz("2025-04-01", "YYYY-MM-DD", "America/Toronto"),
	},
	{
		albumId: "",
		date: dayjs.tz("2025-04-02", "YYYY-MM-DD", "America/Toronto"),
	},
];

export const miscRouter = router({
	albumOfTheDay: publicProcedure.query(() => {
		const timezone = "America/Toronto";
		const now = dayjs().tz(timezone);
		const albumOfTheDay = albums.find((album) => {
			if (now.isSame(album.date, "day") && album.albumId !== "") {
				return true;
			}
		});
		if (albumOfTheDay) return albumOfTheDay;

		// If there is no album of the day, return yesterday's album
		const yesterday = now.subtract(1, "day");
		const yesterdaysAlbum = albums.find((album) => {
			if (yesterday.isSame(album.date, "day") && album.albumId !== "") {
				return true;
			}
		});

		const fallbackAlbum = {
			albumId: "44730061",
			date: dayjs.tz("2024-02-23", "YYYY-MM-DD", "America/Toronto"),
		};

		return yesterdaysAlbum ? yesterdaysAlbum : fallbackAlbum;
	}),
});
