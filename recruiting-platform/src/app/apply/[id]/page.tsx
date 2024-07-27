"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export default function ApplicationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobData = searchParams.get("jobData");
  const job = jobData ? JSON.parse(jobData) : null;

  const [resume, setResume] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertType | null>(null);

  const submitApplication = api.item.submitApplication.useMutation({
    onSuccess: async () => {
      setAlert({ message: "Application submitted successfully!", type: 'success' });
      setTimeout(() => {
        router.push(`/candidate/`);
      }, 2000);
    },
    onError: (error) => {
      console.error("Error submitting application:", error.message);
      setAlert({ message: `Failed to submit application: ${error.message}`, type: 'error' });
    },
  });

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setResume(file);
        setResumeError(null);
      } else {
        setResumeError("Please upload a PDF file.");
        setResume(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (job && resume) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Resume = reader.result as string;
        submitApplication.mutate({
          jobId: job.id.toString(),
          candidateId: "8044241007",
          resume: {
            filename: resume.name,
            content: base64Resume.split(',')[1],
            content_type: resume.type
          }
        });
      };
      reader.readAsDataURL(resume);
    } else {
      setResumeError("Please upload a resume before submitting.");
    }
  };
    
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Apply for Role</h1>
      {alert && (
        <div className={`p-4 mb-4 rounded-md ${alert.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {alert.message}
        </div>
      )}
      {job && (
        <div className="mb-6 p-4 border rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">{job.name}</h2>
          <p><strong>Requisition ID:</strong> {job.requisition_id}</p>
          <p><strong>Status:</strong> {job.status}</p>
          <p><strong>Created At:</strong> {formatDate(job.created_at)}</p>
          <p><strong>Opened At:</strong> {formatDate(job.opened_at)}</p>
          <p><strong>Closed At:</strong> {formatDate(job.closed_at)}</p>
          <p><strong>Departments:</strong> {job.departments.map(dept => dept.name).join(", ")}</p>
          <p><strong>Offices:</strong> {job.offices.map(office => office.name).join(", ")}</p>
          <p><strong>Salary Range:</strong> {job.custom_fields.salary_range.min_value} - {job.custom_fields.salary_range.max_value} {job.custom_fields.salary_range.unit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
            <span className="label-text">Required: Upload resume</span>
          </label>
          <input
            type="file"
            id="resume"
            accept=".pdf"
            onChange={handleResumeChange}
            className="file-input w-full max-w-xs"
          />
          {resumeError && <p className="mt-2 text-sm text-red-600">{resumeError}</p>}
        </div>
        <button
          type="submit"
          className="btn"
          disabled={!resume || submitApplication.isLoading}
        >
          {submitApplication.isLoading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}