import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export const DEAD_LETTER_QUEUE_NAME = 'email-notifications-dead-letter';

export const deadLetterQueue = new Queue(DEAD_LETTER_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: false,
    removeOnFail: false
  }
});
