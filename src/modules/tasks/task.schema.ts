import { z } from 'zod';

const statusEnum = z.enum(['todo', 'in_progress', 'review', 'done']);
const priorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);

export const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  dueDate: z.coerce.date().optional()
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  dueDate: z.coerce.date().nullable().optional()
});
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const listTasksQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  assignee: z.string().uuid().optional(),
  dueDateFrom: z.coerce.date().optional(),
  dueDateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

export const assignTaskSchema = z.object({
  userId: z.string().uuid()
});
export type AssignTaskInput = z.infer<typeof assignTaskSchema>;
