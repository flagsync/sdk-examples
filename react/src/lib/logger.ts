import { LogLevel } from '@flagsync/react-sdk';

export interface ILogger {
  setLogLevel(logLevel: LogLevel): void;
  debug(message: any, ...optionalParams: [...any, string?, string?]): void;
  info(message: any, ...optionalParams: [...any, string?, string?]): void;
  log(message: any, ...optionalParams: [...any, string?, string?]): void;
  warn(message: any, ...optionalParams: [...any, string?, string?]): void;
  error(message: any, ...optionalParams: [...any, string?, string?]): void;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
}

const logLevelPriority: Record<LogLevel, number> = {
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  NONE: 5,
};

/**
 * Custom logger that hooks into "@flagsync/react-sdk", allowing for
 * log entries to be captured by React's useState, for the <LogViewer />
 */
export class CustomLogger implements ILogger {
  private logLevel: LogLevel = 'DEBUG';
  private logs: LogEntry[] = [];
  private listeners: Array<(logs: LogEntry[]) => void> = [];

  constructor() {
    // Bind methods to ensure 'this' context is preserved
    this.setLogLevel = this.setLogLevel.bind(this);
    this.debug = this.debug.bind(this);
    this.info = this.info.bind(this);
    this.log = this.log.bind(this);
    this.warn = this.warn.bind(this);
    this.error = this.error.bind(this);
    this.addLog = this.addLog.bind(this);
    this.shouldLog = this.shouldLog.bind(this);
    this.notifyListeners = this.notifyListeners.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.getSnapshot = this.getSnapshot.bind(this);
  }

  setLogLevel(logLevel: LogLevel): void {
    this.logLevel = logLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return logLevelPriority[level] >= logLevelPriority[this.logLevel];
  }

  private addLog(
    level: LogLevel,
    message: any,
    ...optionalParams: any[]
  ): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = [message, ...optionalParams].join(' ');
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = { level, message: formattedMessage, timestamp };

    console.log(`[${timestamp} ${level}] `, message, ...optionalParams);

    // Replace the array (rather than mutating it) so subscribers using
    // useSyncExternalStore see a new snapshot reference and re-render.
    this.logs = [...this.logs, logEntry];
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.logs));
  }

  /**
   * Returns the current snapshot of logs. The reference only changes when a
   * new entry is added, which is what useSyncExternalStore relies on.
   */
  public getSnapshot(): LogEntry[] {
    return this.logs;
  }

  public subscribe(listener: (logs: LogEntry[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  debug(message: any, ...optionalParams: any[]): void {
    this.addLog('DEBUG', message, ...optionalParams);
  }

  info(message: any, ...optionalParams: any[]): void {
    this.addLog('INFO', message, ...optionalParams);
  }

  log(message: any, ...optionalParams: any[]): void {
    this.addLog('INFO', message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]): void {
    this.addLog('WARN', message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]): void {
    this.addLog('ERROR', message, ...optionalParams);
  }
}

export const logger = new CustomLogger();
