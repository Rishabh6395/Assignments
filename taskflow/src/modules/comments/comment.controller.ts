import { Request, Response, NextFunction } from 'express';
import * as commentService from './comment.service';

export async function listCommentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const comments = await commentService.listComments(req.orgContext!.orgId, req.params.taskId);
    res.status(200).json({ data: comments });
  } catch (err) {
    next(err);
  }
}

export async function createCommentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const comment = await commentService.createComment(
      req.orgContext!.orgId,
      req.params.taskId,
      req.user!.id,
      req.body.content
    );
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}
