/* @flow */
import './setup-env';
import { json, send } from 'micro';
import redisClient from './redis-client';

import createStore from './redux-store';

type RawActionType = {
  type: string,
  payload: any,
  meta: ?any,
}

type ActionType = RawActionType & {
  ts: number,
  // TODO: add user_id
}

type RequestType = {
  url: string,
  method: 'GET' | 'PUT' | 'POST' | 'DELETE',
}

const store = createStore();

const appendAction = async (action: RawActionType): Promise<ActionType> => {
  const finalAction = {
    ...action,
    ts: Date.now(),
  };

  store.dispatch(finalAction);

  await redisClient.lpushAsync('actions', JSON.stringify(finalAction));
  return finalAction;
}

export default async (req: RequestType, res: any) => {
  const { url, method } = req;

  switch (method) {
    case 'POST': return await appendAction(await json(req));
    case 'GET': return { data: store.getState().counter };
    default: send(res, 405, `method ${method} not supported`);
  }
}
