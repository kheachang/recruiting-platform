import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import fetch from "node-fetch";

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
    .query(async ({ input }) => {
      const candidateId = input.id;
      const apiUrl = `https://harvest.greenhouse.io/v1/candidates/${candidateId}`;

      console.log(`Fetching candidate with ID: ${candidateId}`);
      console.log(`API URL: ${apiUrl}`);

      try {
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Basic ${Buffer.from(`${process.env.GREENHOUSE_API_KEY}:`).toString("base64")}`,
            "Content-Type": "application/json",
            "On-Behalf-Of": "4408810007", // Replace with the actual Greenhouse user ID
          },
        });

        console.log(`Response status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text(); // Read the error text for debugging
          console.error(`Error response text: ${errorText}`);
          throw new Error(`Failed to fetch candidate: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log(`Candidate data: ${JSON.stringify(data)}`);
        return data;
      } catch (error) {
        console.error(`Error fetching candidate: ${error.message}`);
        throw new Error(`Failed to fetch candidate: ${error.message}`);
      }
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
