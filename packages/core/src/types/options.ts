import type { ServerOptions } from "ws";
import type { EventDefinitions } from "./events";

export type RPCWebSocketOptions = {
	server?: ServerOptions;
	events?: EventDefinitions;
};
