import { createRequestHandler } from "expo-server/adapter/bun";

const CLIENT_BUILD_DIR = `${process.cwd()}/dist/client`;
const SERVER_BUILD_DIR = `${process.cwd()}/dist/server`;
const handleRequest = createRequestHandler({ build: SERVER_BUILD_DIR });

const port = process.env.PORT || 3000;

Bun.serve({
	port: process.env.PORT || 3000,
	async fetch(req) {
		const url = new URL(req.url);
		console.log("Request URL:", url.pathname);

		const staticPath = url.pathname === "/" ? "/index.html" : url.pathname;
		const file = Bun.file(CLIENT_BUILD_DIR + staticPath);

		if (await file.exists()) return new Response(await file.arrayBuffer());

		return handleRequest(req);
	},
});

console.log(`Bun server running at http://localhost:${port}`);
