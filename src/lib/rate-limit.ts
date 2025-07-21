import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create a new Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create a new Ratelimit instance
export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '10 s'), // 5 requests from the same IP in 10 seconds
  analytics: true, // Enable analytics
});
