import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// dummy data for now
interface Role {
  id: number;
  title: string;
  status: string;
  company: string;
}
const roles: Role[] = [
  {
    id: 1,
    title: "Software Engineer",
    status: "applied",
    company: "Airbnb",
  },
];

export const roleRouter = createTRPCRouter({
  getAll: publicProcedure.query(() => {
    return roles;
  }),
});
