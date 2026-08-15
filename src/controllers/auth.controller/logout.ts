import messages from "@/constants/messages.constant";
import { Request, Response } from "express";
import { EnvConfig } from "@/configs/env.config";

export async function logout(_: Request, res: Response) {
  const clearCookieOptions: any = {
    httpOnly: true,
    secure: EnvConfig.NODE_ENV === "production",
    sameSite: EnvConfig.NODE_ENV === "production" ? "none" : "lax",
    path: "/"
  };

  res.clearCookie("auth_token", clearCookieOptions);
  res.clearCookie("user_auth_token", clearCookieOptions);
  res.clearCookie("admin_auth_token", clearCookieOptions);
  res.clearCookie("author_auth_token", clearCookieOptions);
  res.clearCookie("tenant_auth_token", clearCookieOptions);
  return res.json({ message: messages.loggedOut});
}
