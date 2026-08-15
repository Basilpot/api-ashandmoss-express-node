import { z } from "zod";

export const CreateCityValidator = z.object({
  cityName: z.string(),
  cityHandle: z.string(),
  cityImage: z.string().optional(),
});

export const UpdateCityValidator = CreateCityValidator.partial();
