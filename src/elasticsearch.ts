import { Client } from '@elastic/elasticsearch';
import {
  ClusterHealthResponse,
  CountResponse,
  GetResponse,
} from '@elastic/elasticsearch/lib/api/types';
import { config } from '../src/configuration';
import { InstructorCourse, winstonLogger } from '@remus1504/micrograde-shared';
import { Logger } from 'winston';

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_ENDPOINT}`,
  'courseElasticSearchServer',
  'debug'
);

const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_ENDPOINT}`,
});

const checkConnection = async (): Promise<void> => {
  let isConnected = false;
  while (!isConnected) {
    try {
      const health: ClusterHealthResponse =
        await elasticSearchClient.cluster.health({});
      log.info(`CourseService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error('Connection to Elasticsearch failed. Retrying...');
      log.log('error', 'CourseService checkConnection() method:', error);
    }
  }
};

async function checkIfIndexExist(indexName: string): Promise<boolean> {
  const result: boolean = await elasticSearchClient.indices.exists({
    index: indexName,
  });
  return result;
}

async function createIndex(indexName: string): Promise<void> {
  try {
    const result: boolean = await checkIfIndexExist(indexName);
    if (result) {
      log.info(`Index "${indexName}" already exists.`);
    } else {
      await elasticSearchClient.indices.create({ index: indexName });
      await elasticSearchClient.indices.refresh({ index: indexName });
      log.info(`Created index ${indexName}`);
    }
  } catch (error) {
    log.error(`An error occurred while creating the index ${indexName}`);
    log.log('error', 'CourseService createIndex() method error:', error);
  }
}

const getDocumentCount = async (index: string): Promise<number> => {
  try {
    const result: CountResponse = await elasticSearchClient.count({ index });
    return result.count;
  } catch (error) {
    log.log(
      'error',
      'CourseService elasticsearch getDocumentCount() method error:',
      error
    );
    return 0;
  }
};

const getIndexedData = async (
  index: string,
  itemId: string
): Promise<InstructorCourse> => {
  try {
    const result: GetResponse = await elasticSearchClient.get({
      index,
      id: itemId,
    });
    return result._source as InstructorCourse;
  } catch (error) {
    log.log(
      'error',
      'CourseService elasticsearch getIndexedData() method error:',
      error
    );
    return {} as InstructorCourse;
  }
};

const addDataToIndex = async (
  index: string,
  itemId: string,
  courseDocument: unknown
): Promise<void> => {
  try {
    await elasticSearchClient.index({
      index,
      id: itemId,
      document: courseDocument,
    });
  } catch (error) {
    log.log(
      'error',
      'CourseService elasticsearch addDataToIndex() method error:',
      error
    );
  }
};

const updateIndexedData = async (
  index: string,
  itemId: string,
  courseDocument: unknown
): Promise<void> => {
  try {
    await elasticSearchClient.update({
      index,
      id: itemId,
      doc: courseDocument,
    });
  } catch (error) {
    log.log(
      'error',
      'CourseService elasticsearch updateIndexedData() method error:',
      error
    );
  }
};

const deleteIndexedData = async (
  index: string,
  itemId: string
): Promise<void> => {
  try {
    await elasticSearchClient.delete({
      index,
      id: itemId,
    });
  } catch (error) {
    log.log(
      'error',
      'CourseService elasticsearch deleteIndexedData() method error:',
      error
    );
  }
};

export {
  elasticSearchClient,
  checkConnection,
  createIndex,
  getDocumentCount,
  getIndexedData,
  addDataToIndex,
  updateIndexedData,
  deleteIndexedData,
};
