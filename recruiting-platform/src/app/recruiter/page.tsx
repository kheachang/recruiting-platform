"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Role } from "../_components/role";

export default function RolesPage() {
  const { data: roles, error, isLoading } = api.role.getAll.useQuery();
  const router = useRouter();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleRoleClick = (id: number) => {
    router.push(`/role/${id}`);
  };


  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Roles you're recruiting for:</h1>
      <div className="flex flex-wrap gap-4">
        {roles?.map((role) => (
          <div
            key={role.id}
            className="cursor-pointer"
            onClick={() => handleRoleClick(role.id)}
          >
            <Role
              id={role.id}
              initialTitle={role.title}
              initialCompany={role.company}
            />
          </div>
        ))}
      </div>

    </div>
  );
}