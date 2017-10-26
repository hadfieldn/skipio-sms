import fs from 'fs';
import { printSchema } from 'graphql/utilities';
import path from 'path';
import schemaForEnv from './schema';

const schema = schemaForEnv({}); // don't need an environment to write the schema
fs.writeFileSync(path.join(__dirname, 'schema.graphql'), printSchema(schema));
