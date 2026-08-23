import { Request, Response, NextFunction } from 'express';
import { emailQueue } from '../../queues/email.queue';
import { NotFoundError } from '../../utils/errors';
import { prisma } from '../../config/prisma';

const STATE_MAP: Record<string, 'pending' | 'active' | 'completed' | 'failed'> = {
  waiting: 'pending',
  delayed: 'pending',
  prioritized: 'pending',
  'waiting-children': 'pending',
  active: 'active',
  completed: 'completed',
  failed: 'failed',
  unknown: 'pending'
};

export async function getJobStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const job = await emailQueue.getJob(req.params.id);
    if (!job) {
      throw new NotFoundError('Job', 'JOB_NOT_FOUND');
    }

    const assigneeUserId = job.data?.assigneeUserId as string | undefined;
    if (assigneeUserId) {
      const membership = await prisma.orgMember.findUnique({
        where: { userId_orgId: { userId: assigneeUserId, orgId: req.orgContext!.orgId } }
      });
      if (!membership) {
        throw new NotFoundError('Job', 'JOB_NOT_FOUND');
      }
    }

    const rawState = await job.getState();
    const status = STATE_MAP[rawState] ?? 'pending';

    res.status(200).json({
      id: job.id,
      status,
      attemptsMade: job.attemptsMade,
      maxAttempts: job.opts.attempts ?? 1,
      failedReason: job.failedReason ?? null,
      data: job.data,
      createdAt: new Date(job.timestamp).toISOString(),
      finishedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null
    });
  } catch (err) {
    next(err);
  }
}
