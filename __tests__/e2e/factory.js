import rp from 'request-promise';
import { factory } from '../../src';

const dispatch = async (url, action) => {
  const options = {
    method: 'POST',
    uri: url,
    body: action,
    json: true,
  };

  return await rp(options);
}

const query = (url, path) => rp({
  method: 'GET',
  uri: url + path,
  json: true,
});

const listen = srv => new Promise((resolve, reject) => {
  srv.listen(err => {
    if (err) {
      return reject(err)
    }

    const {port} = srv.address()
    resolve({
      url: `http://localhost:${port}`,
      close: () => srv.close(),
    });
  })
});

describe('factory', () => {
  test('counter', async () => {
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
    const redisConfig = 'redis://127.0.0.1:6379';
    const server = factory({ reducer, selectors, redisConfig });

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

    const res = await query(url, '/query/counter');
    close();
    expect(res).toEqual({ data: 42 });
  });
});
