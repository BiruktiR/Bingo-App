import { ZodSchema, z } from 'zod';
import { ROLES } from '../other-types/Enums';

export const UserSchema: ZodSchema = z.object({
  full_name: z.string().refine(
    (fullName) => {
      const parts = fullName.trim().split(/\s+/);
      return parts.length === 3 && parts.every((part) => part.length > 0);
    },
    {
      message:
        'Invalid full name format. Expected "firstname middlename lastname".',
    }
  ),
  username: z.string().min(5),
  password: z.string().min(8),
  phone_number: z.string().refine((data) => /^\+2519[0-9]{8}$/.test(data), {
    message: 'Invalid phone number format',
  }),
  role: z.enum([ROLES.admin, ROLES.cashier]),
  status: z.boolean(),
});

export type TUser = z.infer<typeof UserSchema>;
