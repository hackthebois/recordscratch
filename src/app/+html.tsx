import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";
import { useUniwind } from "uniwind";

export default function Root({ children }: PropsWithChildren) {
	const { theme } = useUniwind();
	return (
		<html lang="en" className={theme}>
			<head>
				<meta charSet="utf-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, shrink-to-fit=no"
				/>
				<ScrollViewStyleReset />
			</head>
			<body>{children}</body>
		</html>
	);
}
