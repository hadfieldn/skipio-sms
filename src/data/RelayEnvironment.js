import { Environment, RecordSource, Store } from 'relay-runtime';
import { Network } from 'relay-local-schema';

import schemaForEnv from './schema/schema';
import Env from '../Env';

const schema = schemaForEnv(Env);
const source = new RecordSource();
const store = new Store(source);

console.log('Creating environment...');
const environment = new Environment({
  store,
  network: Network.create({ schema }),
});

export default environment;
