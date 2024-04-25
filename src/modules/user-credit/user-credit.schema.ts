import { ZodSchema, string, z } from 'zod';

export const FindUserCreditSchema: ZodSchema = z.object({
  id: z.string().min(32).optional(),
  userID: z.string().min(32).optional(),
  companyID: z.string().min(32).optional(),
  branchID: z.string().min(32).optional(),
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
export type TFindUserCreditSchema = z.infer<typeof FindUserCreditSchema>;
export const AddUserCreditSchema: ZodSchema = z.object({
  credit: z.number().positive(),
  percentage_cut: z.number().min(0).max(1),
});
export type TAddUserCreditSchema = z.infer<typeof AddUserCreditSchema>;
export const TransferCreditSchema: ZodSchema = z.object({
  credit: z.number().positive(),
});
export type TTransferCreditSchema = z.infer<typeof TransferCreditSchema>;
export const FindTransferHistorySchema: ZodSchema = z.object({
  id: z.string().min(32).optional(),
  senderID: z.string().min(32).optional(),
  receiverID: z.string().min(32).optional(),
  start_date: z
    .string()
    .refine(
      (data) => {
        const parsedDate = new Date(data);

        return !isNaN(parsedDate.getTime());
      },
      {
        message: 'Invalid date string format.',
      }
    )
    .optional(),
  end_date: z
    .string()
    .refine(
      (data) => {
        const parsedDate = new Date(data);

        return !isNaN(parsedDate.getTime());
      },
      {
        message: 'Invalid date string format.',
      }
    )
    .optional(),
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
export type TFindTransferHistorySchema = z.infer<
  typeof FindTransferHistorySchema
>;
