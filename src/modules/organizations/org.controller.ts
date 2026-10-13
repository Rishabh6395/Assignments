import { Request, Response, NextFunction } from 'express';
import * as orgService from './org.service';

export async function listMembersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const members = await orgService.listMembers(req.orgContext!.orgId);
    res.status(200).json({ data: members });
  } catch (err) {
    next(err);
  }
}

export async function addMemberHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await orgService.addMember(req.orgContext!.orgId, req.body);
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
}

export async function removeMemberHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await orgService.removeMember(req.orgContext!.orgId, req.params.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
