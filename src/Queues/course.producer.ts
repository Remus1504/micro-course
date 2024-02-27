import { config } from '../configuration';
import { winstonLogger } from '@remus1504/micrograde';
import { Channel } from 'amqplib';
import { Logger } from 'winston';
import { createConnection } from '../Queues/connection';

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_ENDPOINT}`,
  'courseServiceProducer',
  'debug'
);

const publishDirectMessage = async (
  channel: Channel,
  exchangeName: string,
  routingKey: string,
  message: string,
  logMessage: string
): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    await channel.assertExchange(exchangeName, 'direct');
    channel.publish(exchangeName, routingKey, Buffer.from(message));
    log.info(logMessage);
  } catch (error) {
    log.log(
      'error',
      'CourseService publishDirectMessage() method error:',
      error
    );
  }
};

export { publishDirectMessage };
