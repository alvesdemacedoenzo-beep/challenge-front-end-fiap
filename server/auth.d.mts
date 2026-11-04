import type { IncomingMessage, ServerResponse } from "node:http";
export default function auth(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void>;
