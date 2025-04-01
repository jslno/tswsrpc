import { rpcws } from "rpcws";
import { z } from "zod";
import type { ClientEvents } from "./client";

const events = rpcws.$forwardEvents([
	rpcws.$event(
		{
			id: "ping",
			type: z.string().optional(),
		},
		(_, ctx) => {
			console.log("PING");
			ctx.emit.pong();
		},
	),
	rpcws.$event(
		{
			id: "pong",
			type: z.string().optional(),
		},
		() => {
			console.log("PONG");
		},
	),
]);

export type ServerEvents = typeof events;

const main = async () => {
	const server = await rpcws<ClientEvents>()({
		server: {
			port: 8000,
		},
		events,
	});

	console.log("Websocket server running on ws://localhost:8000");

	await server.emit.ping();
};

void main();
