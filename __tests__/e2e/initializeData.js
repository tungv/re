/* @flow */
import { factory } from '../../src';
import { dispatch, listen, query } from '../../test-helper';

describe('factory', () => {
  test('initialize data', async () => {
    // shared config
    const redisConfig = {
      endpoint: 'redis://localhost:6379',
      bucketPattern: 'test_initialize_data',
    };

    // start 1st server to dispatch
    const server = factory({
      reducer: (state = {}) => state,
      selectors: {},
      redisConfig,
    });

    const { url, close } = await listen(server);
    const action1 = {
      type: 'INCREASE_COUNTER',
      payload: 2
    };
    const action2 = {
      type: 'INCREASE_COUNTER',
      payload: 40
    };

    await dispatch(url, action1);
    await dispatch(url, action2);

    close();

    // create another server instance
    const reducer = (state = { counter: 0 }, { type, payload }) => {
      if (type === 'INCREASE_COUNTER') {
        return {
          counter: state.counter + payload,
        }
      }

      return state;
    };

    const newServer = factory({
      reducer,
      selectors: { counter: state => state.counter },
      redisConfig,
    });

    const { url: newUrl, close: newClose } = await listen(newServer);
    const { data } = await query(newUrl, '/query/counter');
    expect(data).toBe(42);
  });
});
