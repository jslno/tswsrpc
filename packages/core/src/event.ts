import type { EventDefinitions } from "./client";

export const eventRegistry = <T extends EventDefinitions>(defs: T): T => defs;
