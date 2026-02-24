import { Tabs } from "expo-router";

export default function WebLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
			}}
			tabBar={() => <></>}
		></Tabs>
	);
}
