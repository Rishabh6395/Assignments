import { Request, Response, NextFunction } from 'express';
import * as taskService from './task.service';

export async function listTasksHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await taskService.listTasks(req.orgContext!.orgId, req.query as any);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await taskService.getTask(req.orgContext!.orgId, req.params.id);
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
}

export async function createTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await taskService.createTask(req.orgContext!.orgId, req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function updateTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await taskService.updateTask(req.orgContext!.orgId, req.params.id, req.body);
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
}

export async function deleteTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await taskService.deleteTask(req.orgContext!.orgId, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function assignTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await taskService.assignTask(
      req.orgContext!.orgId,
      req.params.id,
      req.body.userId
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function unassignTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await taskService.unassignTask(req.orgContext!.orgId, req.params.id, req.params.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
