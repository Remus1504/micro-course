import { config } from '../src/configuration';
import express, { Express } from 'express';
import { start } from '../src/server';
import { redisConnect } from './redis/redis.connection';
import { databaseConnection } from './database';

function initialize(): void {
  config.cloudinaryConfig();
  databaseConnection();
  const app: Express = express();
  start(app);
  redisConnect();
}
initialize();
