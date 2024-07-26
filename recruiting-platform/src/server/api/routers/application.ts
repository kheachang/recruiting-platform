import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const applicationRouter = createTRPCRouter({
  submit: publicProcedure
    .input(
      z.object({
        roleId: z.number(),
        name: z.string(),
        phone: z.string(),
        email: z.string().email(),
        message: z.string(),
        // TODO: resume submission route
      }),
    )
    .mutation(async ({ input }) => {
      console.log("Application submitted:", input); // submit to greenhouse later
      return { success: true };
    }),
});
