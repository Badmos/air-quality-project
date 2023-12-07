import { Environment, LogLevel, Config } from '../types';

export const getConfig = (): Readonly<Config> => {
  const {
    NODE_ENV = 'development',
    PORT = 6061,
    LOG_LEVEL = 'info',
    DB_NAME = 'air-quality-db',
    DB_HOST,
    DB_PORT = 27017,
    IQAIR_API_KEY,
    IQAIR_BASE_URL = 'http://api.airvisual.com/v2',
    USE_DOCKER,
  } = process.env as {
    [key: string]: string;
  };

  return {
    environment: NODE_ENV as Environment,
    service: 'air-quality-project',
    logLevel: LOG_LEVEL as LogLevel,
    port: PORT,
    iqairApiKey: IQAIR_API_KEY,
    iqairBaseUrl: IQAIR_BASE_URL,
    database: {
      dbName: DB_NAME,
      dbHost: DB_HOST,
      dbPort: DB_PORT,
      dbUri: USE_DOCKER
        ? `mongodb://mongo:${DB_PORT}/${DB_NAME}`
        : `mongodb://localhost:${DB_PORT}/${DB_NAME}`,
    },
  };
};
