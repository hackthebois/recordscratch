import type {
	CreateProfile,
	FeedFilters,
	RateForm,
	ReviewForm,
} from "@/types";
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
