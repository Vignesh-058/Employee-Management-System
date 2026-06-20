import Redis from 'ioredis';
import logger from './logger';

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    // Stop retrying after 3 times to avoid log spam if Redis is actually down
    if (times > 3) {
      return null;
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('connect', () => {
  logger.info('Redis Connected Successfully');
});

// Avoid unhandled promise rejections or spam
redis.on('error', (err) => {
  // Silent fallback: cache middleware will bypass
});
