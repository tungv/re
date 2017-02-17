import { config } from 'dotenv';
import { json } from 'micro';

if (process.env.NODE_ENV !== 'production') {
  config();
}

console.log('process.env.REDIS_ENDPOINT', process.env.REDIS_ENDPOINT);

export default async (req, res) => {
  const { url, method } = req;

  return method === 'POST' ? ({
    url, method, body: await json(req),
  }) : { url, method };
}
