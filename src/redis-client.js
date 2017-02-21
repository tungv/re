import redis from 'redis';
import bluebird from 'bluebird';

// make redis compatible with async await
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

export const createRedisClient = (config: string) => redis.createClient(config);
