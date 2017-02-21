import redis from 'redis';
import bluebird from 'bluebird';

console.log('process.env.REDIS_ENDPOINT', process.env.REDIS_ENDPOINT);

// make redis compatible with async await
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient(`redis://${process.env.REDIS_ENDPOINT}`);

export default client;

export const createRedisClient = (config: string) => redis.createClient(config);
