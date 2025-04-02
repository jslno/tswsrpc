import { describe, expect, it, vi } from "vitest";
import { rpcws } from ".";
import { z } from "zod";
import { client } from "./client";

describe("rpcws", async () => {
	const serverEvents = rpcws.$eventRegistry({
		message: z.string(),
	});

	const clientEvents = rpcws.$eventRegistry({
		"nested.message": z.string(),
	});

	const $server = rpcws<typeof clientEvents>()({
		server: {
			port: 8000,
		},
		events: serverEvents,
	});

	const socket = client<typeof serverEvents>()({
		address: "ws://localhost:8000",
		events: clientEvents,
	});

	it("should allow basic bidirectional events", async () => {
		const server = await $server;

		const clientToServerMsg = "PONG";
		const serverToClientMsg = "PING";

		const serverMessageHandler = vi.fn((msg) => {
			expect(msg).toEqual(clientToServerMsg);
		});
		const socketMessageHandler = vi.fn((msg) => {
			expect(msg).toEqual(serverToClientMsg);
			socket.emit.message(clientToServerMsg);
		});

		server.on.message(serverMessageHandler);
		socket.on.nested.message(socketMessageHandler);

		await server.emit.nested.message(serverToClientMsg);

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(serverMessageHandler).toHaveBeenCalledWith(clientToServerMsg);
		expect(socketMessageHandler).toHaveBeenCalledWith(serverToClientMsg);

		server.$context.server.close();
	});
});
