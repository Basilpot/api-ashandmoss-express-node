import { z } from "zod";

export const CreateRegionValidator = z.object({
  regionName: z.string(),
  regionHandle: z.string(),
  regionImage: z.string().optional(),
});

export const UpdateRegionValidator = CreateRegionValidator.partial();
