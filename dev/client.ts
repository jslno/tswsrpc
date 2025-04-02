import { client as wsClient } from "rpcwebsocket/client";
import { z } from "zod";
import type { serverEvents } from ".";

export const clientEvents = wsClient.$eventRegistry({
	"root.message": z.string(),
});

export const client = wsClient<typeof serverEvents>()({
	address: "ws://localhost:8000",
	events: clientEvents,
});

client.on.root.message((msg) => {
	console.log("Received from server:", msg);
	client.emit.message("PONG");
});
