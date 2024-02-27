import http from 'http';

import 'express-async-errors';
import {
  CustomError,
  IAuthPayload,
  IErrorResponse,
  winstonLogger,
} from '@remus1504/micrograde';
import { Logger } from 'winston';
import { config } from '../src/configuration';
import {
  Application,
  Request,
  Response,
  NextFunction,
  json,
  urlencoded,
} from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import { verify } from 'jsonwebtoken';
import compression from 'compression';
import { checkConnection, createIndex } from '../src/elasticsearch';
import { endPoints } from '../src/endpoints';
import { createConnection } from '../src/Queues/connection';
import { Channel } from 'amqplib';
import {
  consumeCourseDirectMessage,
  consumeSeedDirectMessages,
} from '../src/Queues/course.consumer';

const SERVER_PORT = 4004;
const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_ENDPOINT}`,
  'courseServer',
  'debug'
);
let courseChannel: Channel;

const start = (app: Application): void => {
  securityMiddleware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  startQueues();
  startElasticSearch();
  courseErrorHandler(app);
  startServer(app);
};

const securityMiddleware = (app: Application): void => {
  app.set('trust proxy', 1);
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: config.API_GATEWAY_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    })
  );
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const payload: IAuthPayload = verify(
        token,
        config.JWT_TOKEN!
      ) as IAuthPayload;
      req.currentUser = payload;
    }
    next();
  });
};

const standardMiddleware = (app: Application): void => {
  app.use(compression());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
};

const routesMiddleware = (app: Application): void => {
  endPoints(app);
};

const startQueues = async (): Promise<void> => {
  courseChannel = (await createConnection()) as Channel;
  await consumeCourseDirectMessage(courseChannel);
  await consumeSeedDirectMessages(courseChannel);
};

const startElasticSearch = (): void => {
  checkConnection();
  createIndex('course');
};

const courseErrorHandler = (app: Application): void => {
  app.use(
    (
      error: IErrorResponse,
      _req: Request,
      res: Response,
      next: NextFunction
    ) => {
      log.log('error', `CourseService ${error.comingFrom}:`, error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(error.serializeErrors());
      }
      next();
    }
  );
};

const startServer = (app: Application): void => {
  try {
    const httpServer: http.Server = new http.Server(app);
    log.info(`Course server has started with process id ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Course server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    log.log('error', 'CourseService startServer() method error:', error);
  }
};

export { start, courseChannel };
