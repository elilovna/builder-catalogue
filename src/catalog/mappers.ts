import type { z } from "zod";

import type { Builder, CatalogSet, PieceLine } from "@/domain/domain-types";
import { toPieceCounts } from "@/domain/pieces";

import type { SetDetailSchema, UserDetailSchema } from "./schemas";

type UserDetail = z.infer<typeof UserDetailSchema>;
type SetDetail = z.infer<typeof SetDetailSchema>;

const toInventoryLines = (user: UserDetail): PieceLine[] => {
  const lines: PieceLine[] = [];

  user.collection.forEach((item) => {
    item.variants.forEach((variant) => {
      lines.push({
        designId: item.pieceId,
        colourCode: Number(variant.color), // the API sends "155", we use 155
        quantity: variant.count,
      });
    });
  });
  return lines;
};

const toSetLines = (set: SetDetail): PieceLine[] => {
  const lines: PieceLine[] = set.pieces.map((piece) => ({
    designId: piece.part.designID,
    colourCode: piece.part.material,
    quantity: piece.quantity,
  }));

  return lines;
};

export const toBuilder = (user: UserDetail): Builder => {
  const lines = toInventoryLines(user);

  return {
    id: user.id,
    username: user.username,
    location: user.location,
    inventory: toPieceCounts(lines),
  };
};

export const toCatalogSet = (set: SetDetail): CatalogSet => {
  const lines = toSetLines(set);

  return {
    id: set.id,
    name: set.name,
    setNumber: set.setNumber,
    required: toPieceCounts(lines),
  };
};
