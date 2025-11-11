/**
 * Logger utility for Supabase Edge Functions
 * Controls console output based on DEBUG environment variable
 *
 * Usage:
 * - Set DEBUG=true in environment to enable debug/info logs
 * - In production (DEBUG=false or unset), only errors and warnings are logged
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
    // Check DEBUG environment variable (Deno environment)
    const isDebug = Deno.env.get('DEBUG') === 'true';

    this.config = {
      enableDebug: config?.enableDebug ?? isDebug,
      enableInfo: config?.enableInfo ?? isDebug,
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

// Create logger with custom config
export const createLogger = (config?: Partial<LoggerConfig>) => {
  return new Logger(config);
};

// Default logger instance
export const logger = new Logger();

// Specialized logger for ELI operations
export const eliLogger = createLogger({ prefix: 'ELI' });
