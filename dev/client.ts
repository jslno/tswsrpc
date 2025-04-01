import { client as wsClient } from "rpcws/client";
import type { serverEvents } from ".";
import { z } from "zod";

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
