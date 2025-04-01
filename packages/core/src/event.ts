import type { Event, EventOptions, InferEventOutputHandler } from "./types/events";

export const forwardEvents = <T extends Event[]>(data: T) =>
	Object.assign(data, {
		__brand: "events" as const,
	});

export const event = <O extends EventOptions>(options: O, handler: InferEventOutputHandler<O>) => {
	return {
		...options,
		handler,
	} satisfies Event;
};
