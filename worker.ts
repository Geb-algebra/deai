// worker.ts
import handle from "hono-react-router-adapter/cloudflare-workers";
import server from "./app/server";

// @ts-ignore
import * as build from "virtual:react-router/server-build";

export default handle(build, server);
