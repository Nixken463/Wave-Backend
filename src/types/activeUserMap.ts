import type { ServerWebSocket } from "bun";
import type { WSData } from "./wsdata";
export type activeUserMap = Map<string, Set<ServerWebSocket<WSData>>>