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
			use: (ctx) => {
				if (ctx.data.role !== "admin") {
					return ctx.error("UNAUTHORIZED");
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
		lifecycle: {
			onConnection: () => {
				console.log("Client Connected");
			},
			onListening: () => {
				console.log("Ready to accept connections");
			},
		},
	});

	const socket = client<typeof serverEvents>()({
		address: "ws://localhost:8000",
		events: clientEvents,
	});

	it("should allow basic bidirectional events", async () => {
		const server = await $server;

		const clientToServerMsg = "PONG";
		const serverToClientMsg = "PING";

		const serverMessageHandler = vi.fn((ctx) => {
			expect(ctx.data).toEqual(clientToServerMsg);
		});
		const socketMessageHandler = vi.fn((ctx) => {
			expect(ctx.data).toEqual(serverToClientMsg);
			socket.emit.message(clientToServerMsg);
		});

		server.on.message(serverMessageHandler);
		socket.on.nested.message(socketMessageHandler);

		await server.emit.nested.message(serverToClientMsg);

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(serverMessageHandler).toHaveBeenCalledOnce();
		expect(socketMessageHandler).toHaveBeenCalledOnce();

		server.$context.server.close();
	});

	it("should allow basic middlewares", async () => {
		const server = await $server;

		const serverMessageHandler = vi.fn((ctx) => {
			expect(ctx.data.role).toEqual("admin");
		});

		server.on.middleware.message(serverMessageHandler);

		await socket.emit.middleware.message({
			role: "admin",
		});

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(serverMessageHandler).toHaveBeenCalledOnce();

		const serverMessageHandler2 = vi.fn((_, error) => {
			expect(error.message).toEqual("UNAUTHORIZED");
		});
		server.on.middleware.message(serverMessageHandler2);
		await socket.emit.middleware.message({
			role: "user",
		});

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(serverMessageHandler2).toHaveBeenCalledTimes(1);

		server.$context.server.close();
	});

	it("should allow throwing errors inside event handlers", async () => {
		const server = await $server;

		const serverMessageHandler = vi.fn((ctx, error) => {
			if (error) {
				expect(error.message).toEqual("UNAUTHORIZED");
				return;
			}
			if (ctx.data !== "admin") {
				return ctx.error("UNAUTHORIZED");
			}
		});

		server.on.message(serverMessageHandler);

		await socket.emit.message("user");

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(serverMessageHandler).toHaveBeenCalledTimes(2);

		server.$context.server.close();
	});
});
