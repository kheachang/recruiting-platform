"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Role } from "../_components/role";
import { NavBar } from "../_components/navbar";

export default function RolesPage() {
  const jobId = "4280628007"; // Hard-coded for now, can be dynamic based on your use case
  const { data: job, error, isLoading } = api.item.getJobById.useQuery({ id: jobId });
  const router = useRouter();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleRoleClick = (id: string) => {
    router.push(`/role/${id}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <NavBar></NavBar>
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
