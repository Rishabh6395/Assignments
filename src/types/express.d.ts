import { OrgRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
      orgContext?: {
        orgId: string;
        role: OrgRole;
      };
    }
  }
}

export {};
