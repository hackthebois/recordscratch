import { useAuth } from "@/lib/auth";
import { ExternalPathString, Redirect } from "expo-router";

const IndexPage = () => {
	const status = useAuth((s) => s.status);

	if (status === "unauthenticated") {
		return <Redirect href={"/(auth)/signin" as ExternalPathString} />;
	}

	if (status === "needsonboarding") {
		return <Redirect href={"/(auth)/onboard" as ExternalPathString} />;
	}

	console.log("redirecting to home");

	return <Redirect href={{ pathname: "/(tabs)" as ExternalPathString }} />;
};

export default IndexPage;
