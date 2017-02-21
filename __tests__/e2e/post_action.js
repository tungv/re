import '../../src/setup-env';
import micro, { send } from 'micro';
import rp from 'request-promise';
import tk from 'timekeeper';
import redisClient from '../../src/redis-client';

import service from '../../src';

const NOW = 1330688329321;

const clearRedis = async () => {
  await redisClient.delAsync('actions');
}

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

describe('service endpoint', () => {
  beforeAll(() => {
    const time = new Date(NOW);
    tk.freeze(time);
  });

  beforeEach(async () => await clearRedis());

  test('POST endpoint', async () => {
    const action = {
      type: 'TRANSFER_MONEY',
      payload: {
        from: 'USER1',
        to: 'USER2',
        amount: [1000, 'USD'],
      }
    };

    const server = micro(service);
    const { url, close } = await listen(server);

    const res = await dispatch(url, action);
    close();

    expect(res).toEqual({
      ...action,
      ts: NOW,
    });
  });

  test('GET /query/selector_1', async () => {
    const action1 = {
      type: 'INCREASE_COUNTER',
      payload: 2
    };
    const action2 = {
      type: 'INCREASE_COUNTER',
      payload: 40
    };

    const server = micro(service);
    const { url, close } = await listen(server);

    await dispatch(url, action1);
    await dispatch(url, action2);

    const res = await query(url, '/query/selector_1');

    close();
    expect(res).toEqual({
      data: 42
    });
  })
});
