import { verifyGatewayRequest } from '@remus1504/micrograde-shared';
import { Application } from 'express';
import { courseRoutes } from './Endpoints/course';
import { healthRoutes } from './Endpoints/Health';

const BASE_PATH = '/api/v1/course';

const appRoutes = (app: Application): void => {
  app.use('', healthRoutes());
  app.use(BASE_PATH, verifyGatewayRequest, courseRoutes());
};

export { appRoutes };
