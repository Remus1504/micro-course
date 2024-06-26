import { config } from '../configuration';
import { winstonLogger } from '@remus1504/micrograde-shared';
import { Channel, ConsumeMessage, Replies } from 'amqplib';
import { Logger } from 'winston';
import { createConnection } from '../Queues/connection';
import { seedData, updateCourseReview } from '../Services/course.service';

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_ENDPOINT}`,
  'courseServiceConsumer',
  'debug'
);

const consumeCourseDirectMessage = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = 'micrograde-update-course';
    const routingKey = 'update-course';
    const queueName = 'course-update-queue';
    await channel.assertExchange(exchangeName, 'direct');
    const microgradeQueue: Replies.AssertQueue = await channel.assertQueue(
      queueName,
      { durable: true, autoDelete: false }
    );
    await channel.bindQueue(microgradeQueue.queue, exchangeName, routingKey);
    channel.consume(
      microgradeQueue.queue,
      async (msg: ConsumeMessage | null) => {
        const { courseReview } = JSON.parse(msg!.content.toString());
        await updateCourseReview(JSON.parse(courseReview));
        channel.ack(msg!);
      }
    );
  } catch (error) {
    log.log(
      'error',
      'CourseService CourseConsumer consumeCourseDirectMessage() method error:',
      error
    );
  }
};

const consumeSeedDirectMessages = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = 'micrograde-seed-course';
    const routingKey = 'receive-instructors';
    const queueName = 'seed-course-queue';
    await channel.assertExchange(exchangeName, 'direct');
    const microgradeQueue: Replies.AssertQueue = await channel.assertQueue(
      queueName,
      { durable: true, autoDelete: false }
    );
    await channel.bindQueue(microgradeQueue.queue, exchangeName, routingKey);
    channel.consume(
      microgradeQueue.queue,
      async (msg: ConsumeMessage | null) => {
        const { instructors, count } = JSON.parse(msg!.content.toString());
        await seedData(instructors, count);
        channel.ack(msg!);
      }
    );
  } catch (error) {
    log.log(
      'error',
      'CourseService CourseConsumer consumeCourseDirectMessage() method error:',
      error
    );
  }
};

export { consumeCourseDirectMessage, consumeSeedDirectMessages };
