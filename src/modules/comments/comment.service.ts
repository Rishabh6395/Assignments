import { prisma } from '../../config/prisma';
import { NotFoundError } from '../../utils/errors';

async function assertTaskInOrg(orgId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, deletedAt: null, project: { orgId } }
  });
  if (!task) {
    throw new NotFoundError('Task', 'TASK_NOT_FOUND');
  }
  return task;
}

export async function listComments(orgId: string, taskId: string) {
  await assertTaskInOrg(orgId, taskId);
  return prisma.comment.findMany({
    where: { taskId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' }
  });
}

export async function createComment(
  orgId: string,
  taskId: string,
  authorUserId: string,
  content: string
) {
  await assertTaskInOrg(orgId, taskId);
  return prisma.comment.create({
    data: { taskId, userId: authorUserId, content }
  });
}
