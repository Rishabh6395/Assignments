import { Request, Response, NextFunction } from 'express';
import * as projectService from './project.service';

export async function listProjectsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await projectService.listProjects(req.orgContext!.orgId, req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getProjectHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.getProject(req.orgContext!.orgId, req.params.id);
    res.status(200).json(project);
  } catch (err) {
    next(err);
  }
}

export async function createProjectHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.createProject(req.orgContext!.orgId, req.body);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

export async function updateProjectHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.updateProject(
      req.orgContext!.orgId,
      req.params.id,
      req.body
    );
    res.status(200).json(project);
  } catch (err) {
    next(err);
  }
}

export async function deleteProjectHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await projectService.deleteProject(req.orgContext!.orgId, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function projectDashboardHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const dashboard = await projectService.getProjectDashboard(
      req.orgContext!.orgId,
      req.params.id
    );
    res.status(200).json(dashboard);
  } catch (err) {
    next(err);
  }
}
