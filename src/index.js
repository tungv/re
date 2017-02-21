/* @flow */
import './setup-env';
import { createStore } from 'redux';
import micro, { json, send } from 'micro';
import { createRedisClient } from './redis-client';

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

type HttpServer = {
  listen: Function,
  close: Function,
}

const matchRegExp = (reg: RegExp, str: string): string|null => {
  const matches = str.match(reg);
  if (matches) {
    return matches[1];
  }

  return null;
};

type FactoryArgumentsType = {
  reducer: Function,
  selectors: { [selectorName: string]: Function },
  redisConfig: {
    endpoint: string,
    bucketPattern: string,
  },
}

export const factory = async ({ reducer, selectors, redisConfig }: FactoryArgumentsType): Promise<HttpServer> => {
  const actionsListKey = redisConfig.bucketPattern;
  const redisClient = createRedisClient(redisConfig.endpoint);
  const initialActionArray = await redisClient.lrangeAsync(actionsListKey, 0, -1);


  const initialState = initialActionArray.length === 0 ?
    undefined :
    initialActionArray.reduce((state, jsonAction) => {
      const action = JSON.parse(jsonAction);
      return reducer(state, action);
    }, undefined);


  const store = createStore(reducer, initialState);

  const appendAction = async (action: RawActionType): Promise<ActionType> => {
    const finalAction = {
      ...action,
      ts: Date.now(),
    };

    store.dispatch(finalAction);

    await redisClient.lpushAsync(actionsListKey, JSON.stringify(finalAction));
    return finalAction;
  }

  const server = micro(async (req: RequestType, res: any) => {
    const { url, method } = req;
    try {
      switch (method) {
        case 'POST': return await appendAction(await json(req));
        case 'GET':
          const selectorName = matchRegExp(/^\/query\/(.*)\/?/, url);
          if (!selectorName) {
            send(res, 404, 'selector argument not found');
            return;
          }

          const selector = selectors[selectorName];
          if (!selector) {
            send(res, 404, `selector ${selectorName} not found`);
            return;
          }

          return {data: selector(store.getState())};
        default:
          send(res, 405, `method ${method} not supported`);
      }
    } catch (ex) {
      return send(res, 500, ex);
    }

  })
  return server;
}
