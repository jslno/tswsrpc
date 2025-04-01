import type { ServerOptions } from "ws";
import type { Event } from "./events";

export type RPCWSOptions = {
	server?: ServerOptions;
	events?: Event[];
};
