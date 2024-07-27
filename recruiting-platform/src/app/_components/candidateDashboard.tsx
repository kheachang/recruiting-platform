"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Role } from "./role";
import { Tracker } from "./tracker";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavBar } from "./navbar";

interface Application {
  id: string;
  jobs: { id: string; name: string }[];
  status: string;
  applied_at: string;
  current_stage: { id: string; name: string };
}

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  company: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  last_activity: string;
  is_private: boolean;
  photo_url: string | null;
  attachments: any[];
  phone_numbers: { value: string; type: string }[];
  addresses: { value: string; type: string }[];
  email_addresses: { value: string; type: string }[];
  website_addresses: { value: string; type: string }[];
  social_media_addresses: { value: string }[];
  recruiter: any;
  coordinator: any;
  can_email: boolean;
  tags: string[];
  applications: Application[];
  educations: any[];
  employments: any[];
  linked_user_ids: any[];
}

interface Job {
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

export function CandidateDashboard({ candidateId }: { candidateId: string }) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [roles, setRoles] = useState<Job[]>([]);

  const { data: candidateData, error: candidateError, isLoading: candidateLoading, refetch: refetchCandidate } = api.item.getCandidateById.useQuery({ id: candidateId });
  const { data: jobData, error: jobError, isLoading: jobLoading } = api.item.getJobById.useQuery({ id: "4280628007" }); // hard-coded job ID

  const fetchLatestData = useCallback(() => {
    refetchCandidate();
  }, [refetchCandidate]);

  useEffect(() => {
    fetchLatestData();
    
    window.addEventListener("focus", fetchLatestData);

    return () => {
      window.removeEventListener("focus", fetchLatestData);
    };
  }, [fetchLatestData]);

  useEffect(() => {
    if (candidateData) {
      setCandidate(candidateData as Candidate);
    } else if (candidateError) {
      console.error("Error fetching candidate:", candidateError);
    }
  }, [candidateData, candidateError]);

  useEffect(() => {
    if (jobData) {
      setRoles([jobData]);
    } else if (jobError) {
      console.error("Error fetching job:", jobError);
    }
  }, [jobData, jobError]);

  const getMostRecentApplication = useCallback((jobId: string) => {
    const applicationsForJob = candidate?.applications.filter(app => 
      app.jobs.some(job => job.id === jobId)
    ) || [];
    return applicationsForJob.reduce((mostRecent, app) => 
      new Date(app.applied_at) > new Date(mostRecent?.applied_at) ? app : mostRecent, 
      applicationsForJob[0]
    );
  }, [candidate]);

  const canApplyToRole = useCallback((role: Job) => {
    const mostRecentApplication = getMostRecentApplication(role.id);
    return !mostRecentApplication || (mostRecentApplication.status !== "active" && mostRecentApplication.status !== "in_progress");
  }, [getMostRecentApplication]);

  const applyableRoles = roles.filter(canApplyToRole);

  if (candidateLoading || jobLoading) {
    return <div>Loading...</div>;
  }

  if (candidateError || jobError) {
    return <div>Error loading data</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Candidate Dashboard for {candidate?.first_name} {candidate?.last_name}</h2>
      <section>
        <h3 className="text-2xl font-semibold mb-4">Submit Application To:</h3>
        <p className="mb-4">Your recruiter has invited you to apply to these roles:</p>
        <div className="grid grid-cols-1 gap-4">
          {applyableRoles.length > 0 ? (
            applyableRoles.map(role => {
              const mostRecentApplication = getMostRecentApplication(role.id);
              return (
                <div key={role.id} className="mb-4">
                  <Role
                    id={parseInt(role.id, 10)}
                    initialTitle={role.name}
                  />
                  {mostRecentApplication && mostRecentApplication.status === "rejected" && (
                    <p className="text-yellow-600 mt-2">Your previous application was rejected. You can reapply if you wish.</p>
                  )}
                  <Link
                    href={{
                      pathname: `/apply/${role.id}`,
                      query: { jobData: JSON.stringify(role) }
                    }}
                    className="btn mt-3"
                  >
                    {mostRecentApplication ? 'Reapply for this Role' : 'Apply for this Role'}
                  </Link>
                </div>
              );
            })
          ) : (
            <p>No roles available to apply for.</p>
          )}
        </div>
      </section>
    </div>
  );
}
