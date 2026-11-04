import type { IncomingMessage, ServerResponse } from "node:http";
export default function employeeAccess(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void>;
