import type { ServerOptions } from "ws";
import type { EventDefinitions } from "./events";

export type RPCWSOptions = {
	server?: ServerOptions;
	events?: EventDefinitions;
};
