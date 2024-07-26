import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const JOB_ID = 4280628007; // hard-coded job ID

export const applicationRouter = createTRPCRouter({
  submit: publicProcedure
    .input(
      z.object({
        name: z.string(),
        phone: z.string(),
        email: z.string().email(),
        message: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { name, phone, email, message } = input;
      const resume = ctx.req.files?.resume;

      const formData = new FormData();
      formData.append("job_id", String(JOB_ID));
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("email", email);
      formData.append("message", message);

      if (resume) {
        formData.append("attachments", resume);
      }

      const apiKey = process.env.GREENHOUSE_API_KEY;
      if (!apiKey) {
        throw new Error("API key is not defined in environment variables.");
      }

      const response = await fetch(`https://harvest.greenhouse.io/v1/candidates/{id}/applications`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
        },
        body: formData,
      });


        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    }),
  });
