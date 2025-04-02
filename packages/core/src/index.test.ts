import { describe, expect, it, vi } from "vitest";
import { tswsrpc } from ".";
import { z } from "zod";
import { client } from "./client";

describe("tswsrpc", async () => {
	const serverEvents = tswsrpc.$eventRegistry({
		message: tswsrpc.$event({
			type: z.string(),
		}),
		"middleware.message": client.$event({
			type: z.object({
				role: z.string(),
				error: z.string().optional(),
			}),
			use: (data) => {
				if (data.role !== "admin") {
					return {
						...data,
						error: "UNAUTHORIZED",
					};
				}
			},
		}),
	});

	const clientEvents = client.$eventRegistry({
		"nested.message": client.$event({
			type: z.string(),
		}),
	});

	const $server = tswsrpc<typeof clientEvents>()({
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

	it("should allow basic middlewares", async () => {
		const server = await $server;

		const serverMessageHandler = vi.fn((data) => {
			expect(data.role).toEqual("admin");
		});

		server.on.middleware.message(serverMessageHandler);

		await socket.emit.middleware.message({
			role: "admin",
		});

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(serverMessageHandler).toHaveBeenCalledOnce();

		const serverMessageHandler2 = vi.fn((data) => {
			expect(data.error).toEqual("UNAUTHORIZED");
		});
		server.on.middleware.message(serverMessageHandler2);
		await socket.emit.middleware.message({
			role: "user",
		});

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(serverMessageHandler2).toHaveBeenCalledOnce();

		server.$context.server.close();
	});
});
