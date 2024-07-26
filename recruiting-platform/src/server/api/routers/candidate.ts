import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const candidateRouter = createTRPCRouter({
  createCandidate: publicProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        phone: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const newCandidateId = Math.floor(Math.random() * 1000);
      
      return { id: newCandidateId };
    }),
});
