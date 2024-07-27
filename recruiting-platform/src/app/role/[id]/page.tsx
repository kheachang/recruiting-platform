"use client";

import { NavBar } from "~/app/_components/navbar";
import { RecruiterDashboard } from "~/app/_components/recruiterDashboard";
import { api } from "~/trpc/react";

export default function RoleDetailPage() {
  const jobId = "4280628007"; // hard code job ID for now

  const { data: job, error, isLoading } = api.item.getJobById.useQuery({ id: jobId });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (!job) return <div>Job not found</div>;

  console.log(job)
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <NavBar></NavBar>
      <RecruiterDashboard
        roleId={job.id.toString()}  // convert job id to string
        roleTitle={job.name}
      />
    </div>
  );
}
