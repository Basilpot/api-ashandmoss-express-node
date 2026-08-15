import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import messages from "@/constants/messages.constant";
import express from "express";

export const errorHandler = (
  err: any,
  _req: express.Request,
  res: express.Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: express.NextFunction,
) => {
  console.error("ERROR TYPE:", err.name);
  console.error("ERROR MESSAGE:", err.message);

  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "This record already exists." });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Record not found." });
    }
    return res.status(500).json({ message: messages.serverError });
  }

  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON body" });
  }

  // 4xx errors built with http-errors carry user-safe messages; everything
  // else is a server bug and must not leak its internals.
  const safe = err.expose && err.status && err.status < 500;
  return res.status(err.status || 500).json({
    message: safe ? err.message : messages.serverError,
  });
};
