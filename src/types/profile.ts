import { profile } from "@/server/db";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

const reserved = [
	"artists",
	"artist",
	"albums",
	"album",
	"songs",
	"song",
	"about",
	"terms",
	"onboard",
	"api",
	"list",
	"playlist",
	"support",
	"contact",
	"friends",
	"messages",
	"recommendations",
	"notifications",
	"settings",
	"search",
	"home",
];

export const ProfileNameSchema = z
	.string()
	.min(1, "Must be at least 1 character")
	.max(50, "Must be less than 50 characters");

export const invalidHandleRegex = /[^a-zA-Z0-9_]/g;
export const validHandleRegex = /^[a-zA-Z0-9_]+$/i;
export const ProfileHandleSchema = z
	.string()
	.min(1, "Must be at least 1 character")
	.max(20, "Must be less than 20 characters")
	.regex(validHandleRegex, "Must be letters, numbers, or _")
	.refine((handle) => {
		if (reserved.includes(handle.toLowerCase())) {
			return "Handle is reserved";
		}
		return true;
	});
export const ProfileBioSchema = z
	.string()
	.max(200, "Must be less than 200 characters");

export const ProfileSchema = createSelectSchema(profile, {
	name: ProfileNameSchema,
	handle: ProfileHandleSchema,
	bio: ProfileBioSchema.nullable(),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const CreateProfileSchema = ProfileSchema.pick({
	name: true,
	handle: true,
	bio: true,
});
export type CreateProfile = z.infer<typeof CreateProfileSchema>;

export const WebProfilePhotoSchema = z
	.custom<File>((v) => v instanceof File)
	.refine(
		(file) => file?.size <= 10 * 1024 * 1024,
		`Max image size is 10MB.`,
	);

export const ProfilePhotoSchema = z
	.object({
		uri: z.string(),
		type: z.string(),
		size: z.number(),
	})
	.refine(
		(file) => file?.size <= 10 * 1024 * 1024,
		`Max image size is 10MB.`,
	);

export const OnboardSchema = CreateProfileSchema.extend({
	name: z.string().min(1, "Must be at least 1 character"),
	handle: z.string().min(1, "Must be at least 1 character"),
	bio: z.string().optional(),
	image: ProfilePhotoSchema.optional(),
});
export type Onboard = z.infer<typeof OnboardSchema>;

export const UpdateProfileSchema = CreateProfileSchema;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;

export const WebOnboardSchema = OnboardSchema.extend({
	image: WebProfilePhotoSchema.optional(),
});
export type WebOnboard = z.infer<typeof WebOnboardSchema>;

export const WebUpdateProfileSchema = UpdateProfileSchema.extend({
	bio: ProfileBioSchema.optional(),
	image: WebProfilePhotoSchema.optional(),
});
export type WebUpdateProfile = z.infer<typeof WebUpdateProfileSchema>;

export const UpdateProfileFormSchema = UpdateProfileSchema.extend({
	bio: ProfileBioSchema.optional(),
	image: ProfilePhotoSchema.optional(),
});
export type UpdateProfileForm = z.infer<typeof UpdateProfileFormSchema>;

export const ProfileRoleSchema = ProfileSchema.pick({ role: true });
export type ProfileRole = z.infer<typeof ProfileRoleSchema>;

export const DeactivateProfileSchema = ProfileSchema.pick({ userId: true });
export type Deactivate = z.infer<typeof DeactivateProfileSchema>;
