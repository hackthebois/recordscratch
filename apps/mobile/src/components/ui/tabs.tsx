import { TextClassContext } from "@/components/ui/text";
import { cn } from "@recordscratch/lib";
import * as TabsPrimitive from "@rn-primitives/tabs";
import * as React from "react";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.List
		ref={ref}
		className={cn(
			"native:h-12 native:px-1.5 h-10 items-center justify-center rounded-md border border-border p-1 web:inline-flex",
			className
		)}
		{...props}
	/>
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
	const { value } = TabsPrimitive.useRootContext();
	return (
		<TextClassContext.Provider
			value={cn(
				"text-sm native:text-base font-medium text-muted-foreground web:transition-all",
				value === props.value && "text-foreground"
			)}>
			<TabsPrimitive.Trigger
				ref={ref}
				className={cn(
					"inline-flex items-center justify-center rounded px-3 py-1.5 font-medium text-sm shadow-none web:whitespace-nowrap web:ring-offset-background web:transition-all web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
					props.disabled && "opacity-50 web:pointer-events-none",
					props.value === value && "bg-secondary",
					className
				)}
				{...props}
			/>
		</TextClassContext.Provider>
	);
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Content
		ref={ref}
		className={cn(
			"web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
			className
		)}
		{...props}
	/>
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
