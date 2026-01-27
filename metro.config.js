const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { withNativewind } = require("nativewind/metro");

const config = getSentryExpoConfig(__dirname);

module.exports = withNativewind(config, {
	inlineRem: 16,
});
