import winston from "winston";
import prisma from "@/lib/prisma";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

export function enableDbLogging() {
  prisma.$on("query", (e) => {
    logger.info(
      `[DB QUERY] ${e.query} | [PARAMS] ${e.params} | [DURATION] ${e.duration}ms`
    );
  });

  prisma.$on("error", (e) => {
    logger.error(`[DB ERROR] ${e.message}`);
  });

  prisma.$on("warn", (e) => {
    logger.warn(`[DB WARN] ${e.message}`);
  });

  prisma.$on("info", (e) => {
    logger.info(`[DB INFO] ${e.message}`);
  });
}
