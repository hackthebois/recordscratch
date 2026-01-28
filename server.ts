import { createRequestHandler } from "expo-server/adapter/bun";

const CLIENT_BUILD_DIR = `${process.cwd()}/dist/client`;
const SERVER_BUILD_DIR = `${process.cwd()}/dist/server`;
const handleRequest = createRequestHandler({ build: SERVER_BUILD_DIR });

const port = process.env.PORT || 3000;

const getContentType = (pathname: string) => {
	if (pathname.endsWith(".css")) return "text/css";
	if (pathname.endsWith(".js")) return "application/javascript";
	if (pathname.endsWith(".map")) return "application/json";
	if (pathname.endsWith(".html")) return "text/html";
	if (pathname.endsWith(".png")) return "image/png";
	if (pathname.endsWith(".svg")) return "image/svg+xml";
	return "application/octet-stream";
};

Bun.serve({
	port: process.env.PORT || 3000,
	async fetch(req) {
		const url = new URL(req.url);

		const staticPath = url.pathname === "/" ? "/index.html" : url.pathname;
		const file = Bun.file(CLIENT_BUILD_DIR + staticPath);

		if (await file.exists())
			return new Response(await file.arrayBuffer(), {
				headers: {
					"Content-Type": getContentType(staticPath),
				},
			});

		return handleRequest(req);
	},
});

console.log(`Bun server running at http://localhost:${port}`);
