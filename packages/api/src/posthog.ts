import type {
	CreateProfile,
	FeedFilters,
	RateForm,
	ReviewForm,
} from "@recordscratch/types";
import type { Context } from "hono";
import { PostHog } from "posthog-node";

type PostHogEvent = {
	profile_created: CreateProfile;
	rate: RateForm;
	review: ReviewForm;
	feed: FeedFilters;
};

export const posthog = async <TEvent extends keyof PostHogEvent>(
	ph: PostHog,
	events: [
		TEvent,
		{
			distinctId: string;
			properties: PostHogEvent[TEvent];
		},
	][],
) => {
	events.forEach(([event, payload]) => {
		ph.capture({
			distinctId: payload.distinctId,
			event,
			properties: {
				...payload.properties,
			},
		});
	});
	await ph.shutdown();
};

export const getPostHog = (c: Context) => {
	return new PostHog(c.env.POSTHOG_KEY, {
		host: c.env.POSTHOG_HOST,
	});
};
