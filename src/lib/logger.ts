type LogLevel = "info" | "warn" | "error" | "debug"

interface LogContext {
  [key: string]: unknown
}

const isDev = process.env.NODE_ENV !== "production"

const COLORS: Record<LogLevel, string> = {
  info: "\x1b[36m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
  debug: "\x1b[90m",
}
const RESET = "\x1b[0m"

function formatContext(ctx?: LogContext): string {
  if (!ctx) return ""
  return " " + JSON.stringify(ctx)
}

function log(level: LogLevel, message: string, ctx?: LogContext) {
  if (isDev) {
    const timestamp = new Date().toISOString().slice(11, 23)
    console[level](`${COLORS[level]}[${timestamp}] ${level.toUpperCase()}${RESET} ${message}${formatContext(ctx)}`)
  } else {
    console[level](JSON.stringify({ level, message, ...ctx, timestamp: new Date().toISOString() }))
  }
}

export const logger = {
  info: (message: string, ctx?: LogContext) => log("info", message, ctx),
  warn: (message: string, ctx?: LogContext) => log("warn", message, ctx),
  error: (message: string, ctx?: LogContext) => log("error", message, ctx),
  debug: (message: string, ctx?: LogContext) => log("debug", message, ctx),
}
