const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { withUniwindConfig } = require("uniwind/metro");

const config = getSentryExpoConfig(__dirname);

module.exports = withUniwindConfig(
	{
		...config,
		resolver: {
			...config.resolver,
			unstable_conditionNames: ["browser", "require", "react-native"],
		},
	},
	{
		cssEntryFile: "./src/global.css",
		dtsFile: "./src/uniwind-types.d.ts",
	},
);
