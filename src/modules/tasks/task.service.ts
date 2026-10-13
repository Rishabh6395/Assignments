import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { NotFoundError, BadRequestError, AppError, ConflictError } from '../../utils/errors';
import { normalizePagination, buildPaginatedResponse } from '../../utils/pagination';
import { enqueueTaskAssignedEmail } from '../../queues/email.queue';
import { CreateTaskInput, UpdateTaskInput, ListTasksQuery } from './task.schema';

async function assertProjectInOrg(orgId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId, deletedAt: null }
  });
  if (!project) {
    throw new NotFoundError('Project', 'PROJECT_NOT_FOUND');
  }
  return project;
}

async function getScopedTask(orgId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, deletedAt: null, project: { orgId } },
    include: { assignments: true }
  });
  if (!task) {
    throw new NotFoundError('Task', 'TASK_NOT_FOUND');
  }
  return task;
}

export async function listTasks(orgId: string, query: ListTasksQuery) {
  const { skip, take, page, limit } = normalizePagination(query);

  const where: Prisma.TaskWhereInput = {
    deletedAt: null,
    project: { orgId, ...(query.projectId ? { id: query.projectId } : {}) }
  };

  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.assignee) {
    where.assignments = { some: { userId: query.assignee } };
  }
  if (query.dueDateFrom || query.dueDateTo) {
    where.dueDate = {
      ...(query.dueDateFrom ? { gte: query.dueDateFrom } : {}),
      ...(query.dueDateTo ? { lte: query.dueDateTo } : {})
    };
  }

  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      include: { assignments: { include: { user: { select: { id: true, name: true, email: true } } } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    }),
    prisma.task.count({ where })
  ]);

  return buildPaginatedResponse(tasks, total, { skip, take, page, limit });
}

export async function getTask(orgId: string, taskId: string) {
  return getScopedTask(orgId, taskId);
}

export async function createTask(orgId: string, input: CreateTaskInput) {
  await assertProjectInOrg(orgId, input.projectId);
  return prisma.task.create({
    data: {
      projectId: input.projectId,
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate
    }
  });
}

export async function updateTask(orgId: string, taskId: string, input: UpdateTaskInput) {
  await getScopedTask(orgId, taskId);
  return prisma.task.update({ where: { id: taskId }, data: input });
}

export async function deleteTask(orgId: string, taskId: string) {
  await getScopedTask(orgId, taskId);
  await prisma.task.delete({ where: { id: taskId } });
}

export async function assignTask(orgId: string, taskId: string, userId: string) {
  const task = await getScopedTask(orgId, taskId);

  const membership = await prisma.orgMember.findUnique({
    where: { userId_orgId: { userId, orgId } },
    include: { user: true }
  });
  if (!membership) {
    throw new BadRequestError(
      'The assigned user must belong to the same organization as the task',
      'ASSIGNEE_NOT_IN_ORG'
    );
  }

  const alreadyAssigned = task.assignments.some((a) => a.userId === userId);
  if (alreadyAssigned) {
    throw new ConflictError('User is already assigned to this task', 'ALREADY_ASSIGNED');
  }

  const assignment = await prisma.taskAssignment.create({
    data: { taskId, userId }
  });

  try {
    await enqueueTaskAssignedEmail(
      {
        taskId: task.id,
        taskTitle: task.title,
        assigneeUserId: userId,
        assigneeEmail: membership.user.email,
        assignedByUserId: userId
      },
      { jobId: assignment.id }
    );
  } catch (err) {
    await prisma.taskAssignment.delete({ where: { id: assignment.id } }).catch(() => undefined);
    throw new AppError(
      502,
      'NOTIFICATION_ENQUEUE_FAILED',
      'Failed to schedule assignment notification; assignment was rolled back',
      {}
    );
  }

  return { assignment, jobId: assignment.id };
}

export async function unassignTask(orgId: string, taskId: string, userId: string) {
  const task = await getScopedTask(orgId, taskId);
  const assignment = task.assignments.find((a) => a.userId === userId);
  if (!assignment) {
    throw new NotFoundError('Assignment', 'ASSIGNMENT_NOT_FOUND');
  }
  await prisma.taskAssignment.delete({ where: { id: assignment.id } });
}
