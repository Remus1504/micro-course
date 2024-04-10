import { config } from '../configuration';
import { winstonLogger } from '@remus1504/micrograde-shared';
import { Logger } from 'winston';
import { client } from './redis.connection';

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_ENDPOINT}`,
  'courseCache',
  'debug'
);

const getUserSelectedCourseCategory = async (key: string): Promise<string> => {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
    const response: string = (await client.GET(key)) as string;
    return response;
  } catch (error) {
    log.log(
      'error',
      'CourseService CourseCache getUserSelectedCourseCategory() method error:',
      error
    );
    return '';
  }
};

export { getUserSelectedCourseCategory };
