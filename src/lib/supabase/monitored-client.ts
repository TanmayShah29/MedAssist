import { logger } from "@/lib/logger";

const SLOW_QUERY_THRESHOLD_MS = 1000;

export function wrapQueryWithMonitoring<T>(query: Promise<T>, label: string): Promise<T> {
  const start = Date.now();
  return query
    .then((result) => {
      const duration = Date.now() - start;
      if (duration > SLOW_QUERY_THRESHOLD_MS) {
        logger.warn(`Slow query [${label}]: ${duration}ms`);
      }
      return result;
    })
    .catch((error) => {
      const duration = Date.now() - start;
      logger.error(`Query failed [${label}]: ${duration}ms`, error);
      throw error;
    });
}
