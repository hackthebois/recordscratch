import env from "@/env";
import type { Profile } from "@/types";

export const getImageUrl = (profile: Profile) => {
	return profile.deactivated
		? ""
		: `${env.R2_PUBLIC_URL}/profile-images/${profile.userId}?updatedAt=${new Date(profile.updatedAt).getTime()}`;
};
