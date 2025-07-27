// worker.ts
import { createRequestHandler } from "react-router";
import server from "./app/server";

const build = await import("virtual:react-router/server-build");
const requestHandler = createRequestHandler(build, import.meta.env.MODE);

server.get("*", (c) =>
	requestHandler(c.req.raw, {
		cloudflare: {
			env: c.env,
			ctx: Object.assign(c.executionCtx, { props: undefined }),
		},
	}),
);

export default {
	fetch: server.fetch,
};
