import z  from "zod";

export const AdminType = z.enum(["SUPERADMIN", "MODERATOR", "SUPPORT"]);

export const adminValidator = z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    role: AdminType.default("SUPPORT"),
})

export const adminLoginValidator = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
})