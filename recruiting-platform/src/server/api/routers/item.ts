import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

interface Candidate {
  id: string;
  name: string;
  status: string;
  roleStatuses: { roleId: string; status: string }[]; // Track roles and their statuses
}

interface Role {
  id: string;
  name: string;
  company: string;
}

const candidates: Candidate[] = [
  {
    id: "1",
    name: "Alice Johnson",
    status: "Onsite",
    roleStatuses: [{ roleId: "1", status: "Applied" }],
  },
];

const roles: Role[] = [
  { id: "1", name: "Software Engineer", company: "Airbnb" },
  { id: "2", name: "Product Manager", company: "Google" },
];

export const itemsRouter = createTRPCRouter({
  getAllCandidates: publicProcedure.query(() => {
    return candidates;
  }),

  getCandidatesByRoleId: publicProcedure
    .input(z.object({ roleId: z.string() }))
    .query(({ input }) => {
      return candidates.filter((candidate) =>
        candidate.roleStatuses.some(
          (roleStatus) => roleStatus.roleId === input.roleId,
        ),
      );
    }),

  getCandidateById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return candidates.find((candidate) => candidate.id === input.id);
    }),

  getAllRoles: publicProcedure.query(() => {
    return roles;
  }),

  updateCandidateRoleStatus: publicProcedure
    .input(
      z.object({
        candidateId: z.string(),
        roleId: z.string(),
        status: z.string(),
      }),
    )
    .mutation(({ input }) => {
      const candidate = candidates.find((c) => c.id === input.candidateId);
      if (candidate) {
        const roleStatus = candidate.roleStatuses.find(
          (rs) => rs.roleId === input.roleId,
        );
        if (roleStatus) {
          roleStatus.status = input.status;
        } else {
          candidate.roleStatuses.push({
            roleId: input.roleId,
            status: input.status,
          });
        }
        return candidate;
      }
      throw new Error("Candidate not found");
    }),
});
