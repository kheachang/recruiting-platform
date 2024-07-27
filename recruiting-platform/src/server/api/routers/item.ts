import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import fetch from "node-fetch";

const makeGreenhouseRequest = async (url: string) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.GREENHOUSE_API_KEY}:`).toString("base64")}`,
      "Content-Type": "application/json",
      "On-Behalf-Of": "4408810007",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Greenhouse API request failed: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return response.json();
};

export const itemsRouter = createTRPCRouter({
  getCandidatesByRoleId: publicProcedure
    .input(z.object({ roleId: z.string() }))
    .query(async ({ input }) => {
      const { roleId } = input;
      const apiUrl = `https://harvest.greenhouse.io/v1/applications?job_id=${roleId}`;

      try {
        const applications = await makeGreenhouseRequest(apiUrl);

        const candidatesWithDetails = await Promise.all(
          applications.map(async (application) => {
            const candidateId = application.candidate_id;
            const candidateUrl = `https://harvest.greenhouse.io/v1/candidates/${candidateId}`;
            
            try {
              const candidateData = await makeGreenhouseRequest(candidateUrl);
              return {
                ...application,
                candidate_name: `${candidateData.first_name} ${candidateData.last_name}`,
                candidate_details: candidateData,
              };
            } catch (error) {
              console.error(`Failed to fetch candidate ${candidateId}: ${error.message}`);
              return {
                ...application,
                candidate_name: `Candidate ${candidateId}`,
                candidate_details: null,
              };
            }
          }),
        );

        console.log("API Response:", candidatesWithDetails);

        return candidatesWithDetails;
      } catch (error) {
        console.error(`Error fetching candidates: ${error.message}`);
        throw new Error(`Failed to fetch candidates: ${error.message}`);
      }
    }),

  getCandidateById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const candidateId = input.id;
      const apiUrl = `https://harvest.greenhouse.io/v1/candidates/${candidateId}`;

      console.log(`Fetching candidate with ID: ${candidateId}`);
      console.log(`API URL: ${apiUrl}`);

      try {
        const data = await makeGreenhouseRequest(apiUrl);
        console.log(`Candidate data: ${JSON.stringify(data)}`);
        return data;
      } catch (error) {
        console.error(`Error fetching candidate: ${error.message}`);
        throw new Error(`Failed to fetch candidate: ${error.message}`);
      }
    }),

  getJobById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const jobId = input.id;
      const apiUrl = `https://harvest.greenhouse.io/v1/jobs/${jobId}`;

      console.log(`Fetching job with ID: ${jobId}`);
      console.log(`API URL: ${apiUrl}`);

      try {
        const data = await makeGreenhouseRequest(apiUrl);
        console.log(`Job data: ${JSON.stringify(data)}`);
        return data;
      } catch (error) {
        console.error(`Error fetching job: ${error.message}`);
        throw new Error(`Failed to fetch job: ${error.message}`);
      }
    }),

  submitApplication: publicProcedure
    .input(
      z.object({
        jobId: z.string(),
        candidateId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { jobId, candidateId } = input;
      const apiUrl = `https://harvest.greenhouse.io/v1/candidates/${candidateId}/applications`;

      const body: any = {
        job_id: jobId,
      };

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${process.env.GREENHOUSE_API_KEY}:`).toString("base64")}`,
            "Content-Type": "application/json",
            "On-Behalf-Of": "4408810007",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to submit application: ${response.status} ${response.statusText} - ${errorText}`,
          );
        }

        const data = await response.json();
        return data;
      } catch (error) {
        throw new Error(`Failed to submit application: ${error.message}`);
      }
    }),

  moveCandidate: publicProcedure
    .input(
      z.object({
        applicationId: z.string(),
        fromStageId: z.number(),
        toStageId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const { applicationId, fromStageId, toStageId } = input;
      const apiUrl = `https://harvest.greenhouse.io/v1/applications/${applicationId}/move`;

      const body = {
        from_stage_id: fromStageId,
        to_stage_id: toStageId,
      };

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${process.env.GREENHOUSE_API_KEY}:`).toString("base64")}`,
            "Content-Type": "application/json",
            "On-Behalf-Of": "4408810007",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to move application: ${response.status} ${response.statusText} - ${errorText}`,
          );
        }

        const data = await response.json();
        return data;
      } catch (error) {
        throw new Error(`Failed to move application: ${error.message}`);
      }
    }),

  getJobStagesByJobId: publicProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      const { jobId } = input;
      const apiUrl = `https://harvest.greenhouse.io/v1/jobs/${jobId}/stages`;

      try {
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Basic ${Buffer.from(`${process.env.GREENHOUSE_API_KEY}:`).toString("base64")}`,
            "Content-Type": "application/json",
            "On-Behalf-Of": "4408810007",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch job stages: ${response.status} ${response.statusText} - ${errorText}`,
          );
        }

        const stages = await response.json();
        return stages;
      } catch (error) {
        console.error(`Error fetching job stages: ${error.message}`);
        throw new Error(`Failed to fetch job stages: ${error.message}`);
      }
    }),
});
