"use client";

import { RecruiterDashboard } from "~/app/_components/recruiterDashboard"
import { api } from "~/trpc/react";

export default function RoleDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data: roles, error, isLoading } = api.role.getAll.useQuery(); 
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  const currentRole = roles.find((role) => role.id.toString() === id);
  if (!currentRole) return <div>Role not found</div>;

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <RecruiterDashboard
        roleId={id}
        roleTitle={currentRole.title}
        roleCompany={currentRole.company}
      />
    </div>
  )
}