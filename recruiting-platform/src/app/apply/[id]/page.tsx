"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function ApplicationForm({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

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
    
    submitApplication.mutate({
      jobId: id,
      candidateId: "8044241007",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Apply for Role</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Upload Resume</span>
          </div>
          <input
            type="file"
            className="file-input file-input-bordered w-full max-w-xs"
            onChange={(e) => setResume(e.target.files ? e.target.files[0] : null)}
          />
        </label>
        <button className="btn">Submit</button>
      </form>
    </div>
  );
}
