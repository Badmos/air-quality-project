export type LogLevel = 'info' | 'warn' | 'error';

export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

export interface HealthCheckResponse {
  status: string;
  message: string;
}

export interface ApiRootResponse {
  status: string;
  message: string;
}

export interface Database {
  dbName: string;
  dbHost: string;
  dbUri: string;
  dbPort: string | number;
}

export interface Config {
  environment: Environment;
  service: string;
  logLevel: LogLevel;
  port: string | number;
  iqairApiKey: string;
  iqairBaseUrl: string;
  database: Database;
}

export interface Dates {
  iqAirDateTime: Date;
  airQualitySavedAt: Date;
}
