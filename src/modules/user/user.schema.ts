import { ZodSchema, z } from 'zod';
import { ROLES } from '../../config/other-types/Enums';

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
export const FindUserSchema: ZodSchema = z.object({
  full_name: z.string().optional(),
  username: z.string().optional(),
  phone_number: z.string().optional(),
  companyID: z.string().min(32).optional(),
  branchID: z.string().min(32).optional(),
  id: z.string().min(32).optional(),
  page: z
    .string()
    .refine((data) => !isNaN(Number(data)), {
      message: 'Input must be a valid number',
    })
    .optional(),
  limit: z
    .string()
    .refine((data) => !isNaN(Number(data)), {
      message: 'Input must be a valid number',
    })
    .optional(),
});

export type TFindUserSchema = z.infer<typeof FindUserSchema>;

export const UpdatePasswordSchema: ZodSchema = z
  .object({
    old_password: z.string().min(8),
    new_password: z.string().min(8),
    repeat_password: z.string().min(8),
  })
  .refine((data) => data.new_password === data.repeat_password, {
    message: 'Passwords do not match',
  });

export type TUpdatePasswordSchema = z.infer<typeof UpdatePasswordSchema>;
