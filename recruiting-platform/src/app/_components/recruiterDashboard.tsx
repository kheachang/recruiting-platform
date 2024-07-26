"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Tracker } from "./tracker";
import { Candidate } from "./candidate";

type RecruiterDashboardProps = {
  roleId: string;
  roleTitle: string;
  roleCompany: string;
};

export function RecruiterDashboard({ roleId, roleTitle, roleCompany }: RecruiterDashboardProps) {
  const [candidates, setCandidates] = useState<any[]>([]);

  const { data: candidateData, error, isLoading } = api.item.getCandidatesByRoleId.useQuery({ roleId });

  useEffect(() => {
    if (candidateData) {
      setCandidates(candidateData.map((candidate: any) => ({
        id: candidate.id.toString(),
        name: candidate.name,
        status: candidate.status,
        roleStatuses: candidate.roleStatuses || [], // Ensure roleStatuses is included and is an array
      })));
    }
  }, [candidateData]);

  const statuses = ["Applied", "Phone Screen", "Onsite", "Offer", "Rejected"];

  const fetchCandidates = async () => {
    return candidates;
  };

  const renderCandidate = (candidate: { id: string; name: string; status: string; roleStatuses: { roleId: string; status: string }[] }) => (
    <Candidate
      key={candidate.id}
      id={candidate.id}
      initialName={candidate.name}
      roleStatuses={candidate.roleStatuses}
    />
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">
        Recruiter Dashboard for {roleTitle} at {roleCompany}
      </h2>
      <p>Drag and drop candidates as they go through the interview process.</p>
      <section>
        <Tracker
          statuses={statuses}
          renderItem={renderCandidate}
          fetchItems={fetchCandidates}
        />
      </section>
    </div>
  );
}