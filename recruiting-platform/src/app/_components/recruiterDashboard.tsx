"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Tracker } from "./tracker";
import { Candidate } from "./candidate";

type RecruiterDashboardProps = {
  roleId: string;
  roleTitle: string;
};

const mapCandidatesToTracker = (candidates: any[]): { [key: string]: { candidates: { id: string; name: string }[] } } => {
  const tracker: { [key: string]: { candidates: { id: string; name: string }[] } } = {};
  const latestApplications = new Map<string, { id: string; name: string; status: string; appliedAt: number; }>();
  const recentRejections = new Map<string, { id: string; name: string; }>();

  candidates.forEach((application: any) => {
    const candidateId = application.candidate_id.toString();
    const appliedAt = new Date(application.applied_at).getTime();
    const currentStatus = application.current_stage?.name || 'Unknown';
    const status = application.status;

    if (status === 'rejected') {
      if (!recentRejections.has(candidateId) || recentRejections.get(candidateId).appliedAt < appliedAt) {
        recentRejections.set(candidateId, {
          id: candidateId,
          name: `Candidate ${candidateId}`, // Adjust if actual name is available
          appliedAt
        });
      }
    } else {
      if (!latestApplications.has(candidateId) || latestApplications.get(candidateId).appliedAt < appliedAt) {
        latestApplications.set(candidateId, {
          id: candidateId,
          name: `Candidate ${candidateId}`, // Adjust if actual name is available
          status: currentStatus,
          appliedAt
        });
      }
    }
  });

  if (recentRejections.size > 0) {
    tracker['Rejected'] = { candidates: [] };
    recentRejections.forEach(candidate => {
      tracker['Rejected'].candidates.push({
        id: candidate.id,
        name: candidate.name
      });
    });
  }

  latestApplications.forEach(candidate => {
    if (!tracker[candidate.status]) {
      tracker[candidate.status] = { candidates: [] };
    }
    tracker[candidate.status].candidates.push({
      id: candidate.id,
      name: candidate.name
    });
  });

  console.log('tracker', tracker);
  return tracker;
};

export function RecruiterDashboard({ roleId, roleTitle }: RecruiterDashboardProps) {
  const [trackerData, setTrackerData] = useState<{ [key: string]: { candidates: { id: string; name: string }[] } }>({});
  const { data: candidateData, error, isLoading } = api.item.getCandidatesByRoleId.useQuery({ roleId });

  useEffect(() => {
    if (candidateData) {
      const mappedData = mapCandidatesToTracker(candidateData);
      setTrackerData(mappedData);
    }
  }, [candidateData]);

  const statuses = ["Application Review", "Phone Screen", "Preliminary Phone Screen", "Deep dive", "Rejected"];

  const fetchCandidates = async () => {
    return trackerData;
  };

  const renderCandidate = (candidate: { id: string; name: string; }) => (
    <Candidate
      key={candidate.id}
      id={candidate.id}
      initialName={candidate.name}
      roleStatuses={[]} 
    />
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">
        Recruiter Dashboard for {roleTitle}
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
