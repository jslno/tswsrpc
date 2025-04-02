import type { ServerOptions } from "ws";
import type { EventDefinitions } from "./events";

export type TSWSRPCOptions = {
	server?: ServerOptions;
	events?: EventDefinitions;
};
