// @flow
import { Environment, RecordSource, Store } from 'relay-runtime';
import { Network } from 'relay-local-schema';

import schemaForEnv from './schema/schema';

const source = new RecordSource();
const store = new Store(source);

const Provider = {
  environment: null,
};

export const updateRelayEnvironment = (options: {
  apiKey: string,
  server: string,
  apiVersion: string,
}) => {
  const schema = schemaForEnv(options);
  Provider.environment = new Environment({
    store,
    network: Network.create({ schema }),
  });
};

export default Provider;
