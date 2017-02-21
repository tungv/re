/* @flow */
import { config } from 'dotenv';
import { json } from 'micro';

type ActionType = {
  type: string,
  payload: any,
}

if (process.env.NODE_ENV !== 'production') {
  config();
}

console.log('process.env.REDIS_ENDPOINT', process.env.REDIS_ENDPOINT);

const appendAction = (action: ActionType) => {
  
}

export default async (req, res) => {
  const { url, method } = req;

  return method === 'POST' ? ({
    url, method, body: await json(req),
  }) : { url, method };
}
