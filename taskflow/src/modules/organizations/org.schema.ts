import { z } from 'zod';

export const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['org_admin', 'member']).default('member')
});
export type AddMemberInput = z.infer<typeof addMemberSchema>;
