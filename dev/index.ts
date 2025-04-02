import { rpcwebsocket } from "rpcwebsocket";
import { z } from "zod";
import type { clientEvents } from "./client";

export const serverEvents = rpcwebsocket.$eventRegistry({
	message: z.string(),
});

const main = async () => {
	const server = await rpcwebsocket<typeof clientEvents>()({
		server: {
			port: 8000,
		},
		events: serverEvents,
	});

	server.on.message((msg) => {
		console.log("Received from client:", msg);
	});

	console.log("Websocket server running on ws://localhost:8000");

	await server.emit;
};

void main();
