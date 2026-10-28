import { z } from "zod";

const id = z.string().min(1);
const count = z.int().nonnegative();

export const UserSummarySchema = z.object({
  id,
  username: z.string().min(1),
  location: z.string(),
  brickCount: count,
});

export const UsersSchema = z.object({
  Users: z.array(UserSummarySchema),
});

export const UserDetailSchema = UserSummarySchema.extend({
  collection: z.array(
    z.object({
      pieceId: id,
      variants: z.array(
        z.object({
          color: z.string().regex(/^\d+$/),
          count,
        }),
      ),
    }),
  ),
});

export const SetSummarySchema = z.object({
  id,
  name: z.string().min(1),
  setNumber: z.string(),
  totalPieces: count,
});

export const SetsSchema = z.object({
  Sets: z.array(SetSummarySchema),
});

export const SetDetailSchema = SetSummarySchema.extend({
  pieces: z.array(
    z.object({
      part: z.object({
        designID: id,
        material: count,
        partType: z.string(),
      }),
      quantity: count,
    }),
  ),
});

export const ColoursSchema = z.object({
  colours: z.array(
    z.object({
      name: z.string().min(1),
      code: count,
    }),
  ),
});
