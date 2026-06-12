import { logger } from "@/lib/logger";

export interface AIMetrics {
  function: string;
  success: boolean;
  durationMs: number;
  biomarkerCount: number;
  salvagedCount: number;
  lowConfidenceCount: number;
  validationErrors: string[];
}

export function recordAIMetrics(metrics: AIMetrics) {
  logger.info("AI Metrics", metrics);

  if (metrics.salvagedCount > metrics.biomarkerCount * 0.5 && metrics.biomarkerCount > 0) {
    logger.error("High salvage rate detected — AI may be degrading", metrics);
  }

  if (metrics.durationMs > 20000) {
    logger.warn("Slow AI response", metrics);
  }
}
