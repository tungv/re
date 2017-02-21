import rp from 'request-promise';

const HOST = 'http://localhost'

export const listen = server => new Promise((resolve, reject) => {
  server.listen(err => {
    if (err) {
      return reject(err)
    }

    const { port } = server.address()
    resolve({
      url: `${HOST}:${port}`,
      close: () => server.close(),
    });
  })
});

export const dispatch = async (url, action) => {
  const options = {
    method: 'POST',
    uri: url,
    body: action,
    json: true,
  };

  return await rp(options);
}

export const query = (url, path) => rp({
  method: 'GET',
  uri: url + path,
  json: true,
});
