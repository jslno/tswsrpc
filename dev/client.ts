import { client as wsClient } from "rpcws/client";
import type { ServerEvents } from ".";

const events = wsClient.$forwardEvents([
	wsClient.$event(
		{
			id: "pong",
		},
		() => {
			console.log("PONG");
		},
	),
	wsClient.$event(
		{
			id: "ping",
		},
		(_, ctx) => {
			console.log("PING");
			ctx.emit.pong();
		},
	),
]);

export type ClientEvents = typeof events;

export const client = wsClient<ServerEvents>()({
	address: "ws://localhost:8000",
	events,
});

setTimeout(() => {
	client.emit.ping();
}, 3000);
