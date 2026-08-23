import { BadRequestError, ConflictError, NotFoundError } from '../../src/utils/errors';

jest.mock('../../src/config/prisma', () => ({
  prisma: {
    task: { findFirst: jest.fn() },
    orgMember: { findUnique: jest.fn() },
    taskAssignment: { create: jest.fn(), delete: jest.fn() }
  }
}));
jest.mock('../../src/queues/email.queue', () => ({
  enqueueTaskAssignedEmail: jest.fn()
}));

import { prisma } from '../../src/config/prisma';
import { enqueueTaskAssignedEmail } from '../../src/queues/email.queue';
import { assignTask } from '../../src/modules/tasks/task.service';

const mockedPrisma = prisma as unknown as {
  task: { findFirst: jest.Mock };
  orgMember: { findUnique: jest.Mock };
  taskAssignment: { create: jest.Mock; delete: jest.Mock };
};
const mockedEnqueue = enqueueTaskAssignedEmail as jest.Mock;

const ORG_ID = 'org-1';
const TASK_ID = 'task-1';
const USER_ID = 'user-1';

function baseTask(overrides: Partial<{ assignments: any[] }> = {}) {
  return {
    id: TASK_ID,
    title: 'Fix the bug',
    projectId: 'project-1',
    assignments: [],
    ...overrides
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('assignTask validation', () => {
  it('throws NOT_FOUND when the task does not belong to the caller org', async () => {
    mockedPrisma.task.findFirst.mockResolvedValue(null);

    await expect(assignTask(ORG_ID, TASK_ID, USER_ID)).rejects.toBeInstanceOf(NotFoundError);
    expect(mockedPrisma.orgMember.findUnique).not.toHaveBeenCalled();
  });

  it('throws when the assignee does not belong to the same organization as the task', async () => {
    mockedPrisma.task.findFirst.mockResolvedValue(baseTask());
    mockedPrisma.orgMember.findUnique.mockResolvedValue(null);

    await expect(assignTask(ORG_ID, TASK_ID, USER_ID)).rejects.toBeInstanceOf(BadRequestError);
    expect(mockedPrisma.taskAssignment.create).not.toHaveBeenCalled();
  });

  it('throws a conflict when the user is already assigned to the task', async () => {
    mockedPrisma.task.findFirst.mockResolvedValue(
      baseTask({ assignments: [{ userId: USER_ID }] })
    );
    mockedPrisma.orgMember.findUnique.mockResolvedValue({
      userId: USER_ID,
      orgId: ORG_ID,
      user: { email: 'bob@acme.test' }
    });

    await expect(assignTask(ORG_ID, TASK_ID, USER_ID)).rejects.toBeInstanceOf(ConflictError);
    expect(mockedPrisma.taskAssignment.create).not.toHaveBeenCalled();
  });

  it('persists the assignment and enqueues a notification job on success', async () => {
    mockedPrisma.task.findFirst.mockResolvedValue(baseTask());
    mockedPrisma.orgMember.findUnique.mockResolvedValue({
      userId: USER_ID,
      orgId: ORG_ID,
      user: { email: 'bob@acme.test' }
    });
    mockedPrisma.taskAssignment.create.mockResolvedValue({ id: 'assignment-1', taskId: TASK_ID, userId: USER_ID });
    mockedEnqueue.mockResolvedValue({ id: 'assignment-1' });

    const result = await assignTask(ORG_ID, TASK_ID, USER_ID);

    expect(mockedPrisma.taskAssignment.create).toHaveBeenCalledWith({
      data: { taskId: TASK_ID, userId: USER_ID }
    });
    expect(mockedEnqueue).toHaveBeenCalledWith(
      expect.objectContaining({ taskId: TASK_ID, assigneeUserId: USER_ID, assigneeEmail: 'bob@acme.test' }),
      { jobId: 'assignment-1' }
    );
    expect(result.jobId).toBe('assignment-1');
  });

  it('rolls back the assignment (compensating action) if enqueueing the job fails', async () => {
    mockedPrisma.task.findFirst.mockResolvedValue(baseTask());
    mockedPrisma.orgMember.findUnique.mockResolvedValue({
      userId: USER_ID,
      orgId: ORG_ID,
      user: { email: 'bob@acme.test' }
    });
    mockedPrisma.taskAssignment.create.mockResolvedValue({ id: 'assignment-1', taskId: TASK_ID, userId: USER_ID });
    mockedEnqueue.mockRejectedValue(new Error('Redis unavailable'));
    mockedPrisma.taskAssignment.delete.mockResolvedValue({});

    await expect(assignTask(ORG_ID, TASK_ID, USER_ID)).rejects.toThrow(
      /Failed to schedule assignment notification/
    );

    expect(mockedPrisma.taskAssignment.delete).toHaveBeenCalledWith({ where: { id: 'assignment-1' } });
  });
});
