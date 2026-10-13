import { Worker, QueueEvents, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { EMAIL_QUEUE_NAME, TaskAssignedEmailJob } from './email.queue';
import { deadLetterQueue } from './deadLetter.queue';

async function sendMockEmail(data: TaskAssignedEmailJob): Promise<void> {
  console.log(
    `[email] Sending "task assigned" notification to ${data.assigneeEmail} for task "${data.taskTitle}" (${data.taskId})`
  );
}

export function createEmailWorker(): Worker<TaskAssignedEmailJob> {
  const worker = new Worker<TaskAssignedEmailJob>(
    EMAIL_QUEUE_NAME,
    async (job: Job<TaskAssignedEmailJob>) => {
      await sendMockEmail(job.data);
    },
    { connection: redisConnection, concurrency: 5 }
  );

  worker.on('completed', (job) => {
    console.log(`[email-worker] job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[email-worker] job ${job?.id} failed (attempt ${job?.attemptsMade}): ${err.message}`);
  });

  return worker;
}

export function createDeadLetterRouter(): QueueEvents {
  const queueEvents = new QueueEvents(EMAIL_QUEUE_NAME, { connection: redisConnection });

  queueEvents.on('failed', async ({ jobId, failedReason }) => {
    try {
      const { emailQueue } = await import('./email.queue');
      const job = await emailQueue.getJob(jobId);
      if (!job) return;

      const attemptsMade = job.attemptsMade;
      const maxAttempts = job.opts.attempts ?? 1;

      if (attemptsMade >= maxAttempts) {
        await deadLetterQueue.add('dead-letter', {
          originalJobId: job.id,
          data: job.data,
          failedReason,
          attemptsMade
        });
        console.error(`[dead-letter] job ${jobId} moved to dead-letter queue after ${attemptsMade} attempts`);
      }
    } catch (err) {
      console.error('[dead-letter] failed to route job to dead-letter queue', err);
    }
  });

  return queueEvents;
}
