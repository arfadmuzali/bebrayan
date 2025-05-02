import { z } from "zod";

export const profileSchema = z.object({
  image: z.string().optional(),
  username: z.string().min(2).max(30),
  bio: z.string().max(200).optional(),
});

export type ProfileSchema = z.infer<typeof profileSchema>;
