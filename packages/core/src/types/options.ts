import type { ServerOptions } from "ws";
import type { EventDefinitions } from "./events";

export type WSRPCOptions = {
	server?: ServerOptions;
	events?: EventDefinitions;
};
