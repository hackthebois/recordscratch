import * as Slot from "@/components/primitives/slot";
import { SlottableTextProps, TextRef } from "@/components/primitives/types";
import { cn } from "@/lib";
import { VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { Text as RNText } from "react-native";

const TextClassContext = React.createContext<string | undefined>(undefined);

export const textVariants = cva("text-foreground", {
	variants: {
		variant: {
			text: "font-normal",
			h1: "text-4xl font-bold",
			h2: "text-3xl font-bold",
			h3: "text-2xl font-bold",
			h4: "text-xl font-bold",
		},
	},
	defaultVariants: {
		variant: "text",
	},
});

interface TextProps
	extends SlottableTextProps, VariantProps<typeof textVariants> {}

const Text = React.forwardRef<TextRef, TextProps>(
	({ className, asChild = false, variant, ...props }, ref) => {
		const textClass = React.useContext(TextClassContext);
		const Component = asChild ? Slot.Text : RNText;

		return (
			<Component
				className={cn(
					"text-base text-foreground web:select-text",
					textClass,
					textVariants({ variant, className }),
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Text.displayName = "Text";

export { Text, TextClassContext };
