export type RedisConfigType = {
  endpoint: string,
  bucketPattern: string,
};

export type RequestType = {
  url: string,
  method: 'GET' | 'PUT' | 'POST' | 'DELETE',
}

export type HttpServerType = {
  listen: Function,
  close: Function,
}

export type FactoryArgumentsType = {
  reducer: Function,
  selectors: { [selectorName: string]: Function },
  redisConfig: RedisConfigType,
}
