"use client";

import { NavBar } from "~/app/_components/navbar";
import { RecruiterDashboard } from "~/app/_components/recruiterDashboard";
import { api } from "~/trpc/react";

export interface Job {
  id: string;
  name: string;
  requisition_id: string;
  status: string;
  departments: { id: string; name: string }[];
  offices: { id: string; name: string; location?: { name: string } }[];
  hiring_team: {
    hiring_managers: any[];
    recruiters: any[];
    coordinators: any[];
    sourcers: any[];
  };
  openings: { id: string; opening_id: string; status: string; opened_at: string; closed_at: string | null; application_id: string | null; close_reason: string | null }[];
  custom_fields: {
    employment_type: string | null;
    salary_range: { min_value: string; max_value: string; unit: string };
  };
  keyed_custom_fields: {
    employment_type: { name: string; type: string; value: string | null };
    salary_range: { name: string; type: string; value: { min_value: string; max_value: string; unit: string } };
  };
  created_at: string;
  opened_at: string;
  closed_at: string | null;
  updated_at: string;
  notes: string | null;
  confidential: boolean;
  is_template: boolean;
  copied_from_id: string | null;
}

export default function RoleDetailPage() {
  const jobId = "4280628007"; // hard code job ID for now

  const { data: job, error, isLoading } = api.item.getJobById.useQuery({ id: jobId });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (!job) return <div>Job not found</div>;

  const jobData = job as Job;

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <NavBar></NavBar>
      <RecruiterDashboard
        roleId={jobData.id.toString()}
        roleTitle={jobData.name}
      />
    </div>
  );
}
