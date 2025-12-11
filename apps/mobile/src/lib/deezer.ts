import env from "@/env";
import {
	Deezer,
	deezer as d,
	deezerHelpers as dh,
	getQueryOptions as gqo,
} from "@recordscratch/lib";

const baseUrl = env.SITE_URL + "/music";

export const deezer = <TRoute extends keyof Deezer>(input: {
	route: TRoute;
	input: Deezer[TRoute]["input"];
}): Promise<Deezer[TRoute]["output"]> => {
	return d({
		...input,
		baseUrl,
	});
};

export const getQueryOptions = <TRoute extends keyof Deezer>(input: {
	route: TRoute;
	input: Deezer[TRoute]["input"];
}) => {
	return gqo({
		...input,
		baseUrl,
	});
};

export const deezerHelpers = dh(baseUrl);
