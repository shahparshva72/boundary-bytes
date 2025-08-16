// Simple logging utility for text-to-SQL feature
export class Logger {
  private static isDevelopment = process.env.NODE_ENV === 'development';

  static info(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`[TEXT-TO-SQL INFO] ${message}`, data || '');
    }
  }

  static error(message: string, error?: any) {
    console.error(`[TEXT-TO-SQL ERROR] ${message}`, error || '');
  }

  static warn(message: string, data?: any) {
    if (this.isDevelopment) {
      console.warn(`[TEXT-TO-SQL WARN] ${message}`, data || '');
    }
  }

  static debug(message: string, data?: any) {
    if (this.isDevelopment) {
      console.debug(`[TEXT-TO-SQL DEBUG] ${message}`, data || '');
    }
  }
}

export const logger = Logger;
