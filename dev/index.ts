import { rpcws } from "rpcws";
import { z } from "zod";
import type { clientEvents } from "./client";

export const serverEvents = rpcws.$eventRegistry({
	message: z.string(),
});

const main = async () => {
	const server = await rpcws<typeof clientEvents>()({
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
