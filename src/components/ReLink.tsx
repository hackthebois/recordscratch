import { Link, LinkProps } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

interface ReLinkProps extends LinkProps {
	disabled?: boolean;
	children?: React.ReactNode;
}

const ReLink: React.FC<ReLinkProps> = ({ disabled, children, onPress, ...props }) => {
	if (disabled) {
		return <Pressable onPress={onPress}>{children}</Pressable>;
	}

	return <Link {...props}>{children}</Link>;
};

export default ReLink;
