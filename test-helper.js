import rp from 'request-promise';
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

export const listen = srv => new Promise((resolve, reject) => {
  srv.listen(err => {
    if (err) {
      return reject(err)
    }

    const { port } = srv.address()
    resolve({
      url: `http://localhost:${port}`,
      close: () => srv.close(),
    });
  })
});
