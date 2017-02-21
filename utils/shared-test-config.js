import { createClient } from 'redis';

export const createSharedRedisClient = (bucketPattern) => {
  const redisConfig = {
    endpoint: 'redis://127.0.0.1:6379',
    bucketPattern,
  };

  const redisClient = createClient(redisConfig.endpoint);
  redisClient.delAsync(redisConfig.bucketPattern);

  return {
    redisClient,
    redisConfig,
  };
}
