import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export const EMAIL_QUEUE_NAME = 'email-notifications';

export interface TaskAssignedEmailJob {
  taskId: string;
  taskTitle: string;
  assigneeUserId: string;
  assigneeEmail: string;
  assignedByUserId: string;
}

export const emailQueue = new Queue<TaskAssignedEmailJob>(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 4,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: { count: 500 },
    removeOnFail: false
  }
});

export async function enqueueTaskAssignedEmail(
  data: TaskAssignedEmailJob,
  opts: { jobId?: string } = {}
) {
  return emailQueue.add('task-assigned', data, { jobId: opts.jobId });
}
