"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Role } from "../_components/role";


export default function RolesPage() {
  const jobId = "4280628007"; // hard coding this for now assuming 1 job
  const { data: job, error: jobError, isLoading: jobLoading } = api.item.getJobById.useQuery({ id: jobId });
  const router = useRouter();

  if (jobLoading) return <div>Loading...</div>;
  if (jobError) return <div>Error: {jobError.message}</div>;

  const handleRoleClick = (id: string) => {
    router.push(`/role/${id}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Roles you are recruiting for:</h1>
      <div className="flex flex-wrap gap-4">
        {job ? (
          <div
            key={job.id}
            className="cursor-pointer"
            onClick={() => handleRoleClick(job.id)}
          >
            <Role
              id={job.id}
              initialTitle={job.name}
            />
          </div>
        ) : (
          <p>No job details available.</p>
        )}
      </div>
    </div>
  );
}
