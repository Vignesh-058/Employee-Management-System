import { Request, Response, NextFunction } from 'express';
import { redis } from '../utils/redis';
import logger from '../utils/logger';

export const cacheData = (durationInSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
      if (redis.status === 'ready') {
        const cachedResponse = await redis.get(key);
        if (cachedResponse) {
          return res.status(200).json(JSON.parse(cachedResponse));
        }
      }

      // Override res.json to capture response body and cache it
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        if (redis.status === 'ready') {
          redis.setex(key, durationInSeconds, JSON.stringify(body)).catch((err) => {
            logger.error(`Redis caching error: ${err}`);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error(`Redis middleware error: ${error}`);
      next(); // fallback to database
    }
  };
};
