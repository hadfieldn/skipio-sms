import { Environment, RecordSource, Store } from 'relay-runtime';
import { Network } from 'relay-local-schema';

import schemaForEnv from './schema/schema';
import Env from '../Env';

const schema = schemaForEnv(Env);
const source = new RecordSource();
const store = new Store(source);
const environment = new Environment({
  store,
  network: Network.create({ schema }),
});

export default environment;

// const inspector = new RecordSourceInspector(source);
//
// inspector.getNodes(); // all records with an id
// inspector.getRecords(); // all records with or without an id
