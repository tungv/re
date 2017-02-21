/* @flow */
import './setup-env';
import { createStore } from 'redux';
import micro, { json, send } from 'micro';
import { createRedisClient } from './redis-client';
import { computeState } from './state';

import type { RawActionType, ActionType } from './types/Action';
import type { FactoryArgumentsType, RequestType, HttpServerType } from './types/Factory';

const matchRegExp = (reg: RegExp, str: string): string|null => {
  const matches = str.match(reg);
  if (matches) {
    return matches[1];
  }

  return null;
};


// load initialState from actionList in redisClient
// create store
// return server handling requests
export const factory = async ({
  reducer,
  selectors,
  redisConfig,
}: FactoryArgumentsType): Promise<HttpServerType> => {
  const actionsListKey = redisConfig.bucketPattern;
  const redisClient = createRedisClient(redisConfig.endpoint);
  const initialActionArray = await redisClient.lrangeAsync(actionsListKey, 0, -1);

  const initialState = computeState(initialActionArray, reducer, undefined);

  const store = createStore(reducer, initialState);

  const appendAction = async (rawAction: RawActionType): Promise<ActionType> => {
    const action = {
      ...rawAction,
      ts: Date.now(),
    };

    store.dispatch(action);

    await redisClient.lpushAsync(actionsListKey, JSON.stringify(action));
    return action;
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

          return { data: selector(store.getState()) };
        default:
          send(res, 405, `method ${method} not supported`);
      }
    } catch (ex) {
      return send(res, 500, ex);
    }

  })
  return server;
}
