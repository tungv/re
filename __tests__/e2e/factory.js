/* @flow */
import rp from 'request-promise';
import { createSharedRedisClient } from '../../utils/shared-test-config';
import { factory } from '../../src';
import { dispatch, listen, query } from '../../utils/test-helpers';

describe('factory', () => {
  test('counter', async () => {
    const { redisConfig } = createSharedRedisClient('actions');

    const reducer = (state = { counter: 0 }, { type, payload }) => {
      if (type === 'INCREASE_COUNTER') {
        return {
          counter: state.counter + payload,
        }
      }
      return state;
    };

    const selectors = {
      counter: state => state.counter,
    };

    const server = await factory({ reducer, selectors, redisConfig });

    const { url, close } = await listen(server);

    const action1 = {
      type: 'INCREASE_COUNTER',
      payload: 1
    };
    const action2 = {
      type: 'INCREASE_COUNTER',
      payload: 88
    };

    await dispatch(url, action1);
    await dispatch(url, action2);

    const res = await query(url, '/query/counter');
    close();
    expect(res).toEqual({ data: 89 });
  });
});
