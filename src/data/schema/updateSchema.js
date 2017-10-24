import fs from 'fs';
import { printSchema } from 'graphql/utilities';
import path from 'path';
import schemaForEnv from './schema';
require('../../../public/env');

const schema = schemaForEnv(global.__Environment);

fs.writeFileSync(
  path.join(__dirname, 'schema.graphql'),
  printSchema(schema),
);
