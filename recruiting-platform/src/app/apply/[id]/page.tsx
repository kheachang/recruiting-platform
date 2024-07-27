"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

export default function ApplicationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobData = searchParams.get("jobData");
  const job = jobData ? JSON.parse(jobData) : null;

  const [resume, setResume] = useState<File | null>(null);

  const submitApplication = api.item.submitApplication.useMutation({
    onSuccess: async () => {
      router.push(`/candidate/`);
    },
    onError: (error) => {
      console.error("Error submitting application:", error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (job) {
      submitApplication.mutate({
        jobId: "4280628007",
        candidateId: "8044241007",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Apply for Role</h1>

      {job && (
        <div className="mb-6 p-4 border rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">{job.name}</h2>
          <p><strong>Requisition ID:</strong> {job.requisition_id}</p>
          <p><strong>Status:</strong> {job.status}</p>
          <p><strong>Created At:</strong> {new Date(job.created_at).toLocaleDateString()}</p>
          <p><strong>Opened At:</strong> {job.opened_at ? new Date(job.opened_at).toLocaleDateString() : "N/A"}</p>
          <p><strong>Closed At:</strong> {job.closed_at ? new Date(job.closed_at).toLocaleDateString() : "N/A"}</p>
          <p><strong>Departments:</strong> {job.departments.map(dept => dept.name).join(", ")}</p>
          <p><strong>Offices:</strong> {job.offices.map(office => office.name).join(", ")}</p>
          <p><strong>Salary Range:</strong> {job.custom_fields.salary_range.min_value} - {job.custom_fields.salary_range.max_value} {job.custom_fields.salary_range.unit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <button className="btn">Submit</button>
      </form>
    </div>
  );
}
