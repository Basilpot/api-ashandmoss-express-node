import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { EnvConfig } from "@config/env.config";
import messages from "@/constants/messages.constant";

export const adminMiddleware = (req: any, res: any, next: NextFunction) => {
    const token = req.cookies?.admin_auth_token;

    if (!token) {
        return res.status(401).json({ message: messages.unAuthorized });
    }

    try {
        const decoded = jwt.verify(token, EnvConfig.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ message: messages.invalidToken});
    }
}