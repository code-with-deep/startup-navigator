const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  info: (message: string, data?: object) => {
    if (isDev) console.warn(`[INFO] ${message}`, data ?? '');
  },
  warn: (message: string, data?: object) => {
    console.warn(`[WARN] ${message}`, data ?? '');
  },
  error: (message: string, error: unknown, data?: object) => {
    console.error(`[ERROR] ${message}`, error, data ?? '');
  },
};
