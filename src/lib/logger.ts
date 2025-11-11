/**
 * Logger utility - controls console output based on environment
 * In production, only errors and warnings are logged
 * In development, all logs are visible
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enableDebug: boolean;
  enableInfo: boolean;
  prefix?: string;
}

class Logger {
  private config: LoggerConfig;

  constructor(config?: Partial<LoggerConfig>) {
    const isDev = import.meta.env.DEV;

    this.config = {
      enableDebug: config?.enableDebug ?? isDev,
      enableInfo: config?.enableInfo ?? isDev,
      prefix: config?.prefix,
    };
  }

  private formatMessage(level: LogLevel, args: any[]): any[] {
    const timestamp = new Date().toISOString();
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : '';
    const levelStr = `[${level.toUpperCase()}]`;

    return [`${timestamp} ${levelStr}${prefix}`, ...args];
  }

  debug(...args: any[]) {
    if (this.config.enableDebug) {
      console.log(...this.formatMessage('debug', args));
    }
  }

  info(...args: any[]) {
    if (this.config.enableInfo) {
      console.info(...this.formatMessage('info', args));
    }
  }

  warn(...args: any[]) {
    console.warn(...this.formatMessage('warn', args));
  }

  error(...args: any[]) {
    console.error(...this.formatMessage('error', args));
  }

  // Group logging for complex operations
  group(label: string) {
    if (this.config.enableDebug) {
      console.group(label);
    }
  }

  groupEnd() {
    if (this.config.enableDebug) {
      console.groupEnd();
    }
  }
}

// Default logger instance
export const logger = new Logger();

// Create logger with custom config
export const createLogger = (config?: Partial<LoggerConfig>) => {
  return new Logger(config);
};

// Specialized loggers for different parts of the app
export const apiLogger = createLogger({ prefix: 'API' });
export const streamLogger = createLogger({ prefix: 'STREAM' });
export const authLogger = createLogger({ prefix: 'AUTH' });
