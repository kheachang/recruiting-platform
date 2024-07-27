"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Tracker } from "./tracker";
import { Candidate } from "./candidate";

type RecruiterDashboardProps = {
  roleId: string;
  roleTitle: string;
};

interface Candidate {
  id: string;
  name: string;
  applicationId: string;
}

interface TrackerData {
  [key: string]: {
    candidates: Candidate[];
  };
}

const mapCandidatesToTracker = (candidates: any[]): { [key: string]: { candidates: { id: string; name: string; applicationId: string }[] } } => {
  const tracker: { [key: string]: { candidates: { id: string; name: string; applicationId: string }[] } } = {};

  candidates.forEach((application: any) => {
    if (application.status === 'active') {
      const candidateId = application.candidate_id.toString();
      const applicationId = application.id.toString();
      const currentStatus = application.current_stage?.name || 'Unknown';
      const name = application.candidate_name || `Candidate ${candidateId}`;

      if (!tracker[currentStatus]) {
        tracker[currentStatus] = { candidates: [] };
      }
      
      tracker[currentStatus].candidates.push({
        id: candidateId,
        name: name,
        applicationId: applicationId
      });
    }
  });

  return tracker;
};

export function RecruiterDashboard({ roleId, roleTitle }: RecruiterDashboardProps) {
  const [trackerData, setTrackerData] = useState<{ [key: string]: { candidates: { id: string; name: string; applicationId: string }[] } }>({});
  const [statuses, setStatuses] = useState<string[]>([]);
  const [stageMap, setStageMap] = useState<{ [key: string]: number }>({});
  const [stageIdMap, setStageIdMap] = useState<{ [key: number]: string }>({});
  const { data: candidateData, error: candidateError, isLoading: candidateLoading } = api.item.getCandidatesByRoleId.useQuery({ roleId });
  const { data: jobStagesData, error: jobStagesError, isLoading: jobStagesLoading } = api.item.getJobStagesByJobId.useQuery({ jobId: roleId });
  const moveCandidateMutation = api.item.moveCandidate.useMutation();

  useEffect(() => {
    if (candidateData) {
      const mappedData = mapCandidatesToTracker(candidateData);
      setTrackerData(mappedData);
    }
  }, [candidateData]);

  useEffect(() => {
    if (Array.isArray(jobStagesData)) {
      const stageNames = jobStagesData.map((stage) => stage.name);
      setStatuses(stageNames);
  
      const newStageMap: { [key: string]: number } = {};
      const newStageIdMap: { [key: number]: string } = {};
      jobStagesData.forEach((stage) => {
        newStageMap[stage.name] = stage.id;
        newStageIdMap[stage.id] = stage.name;
      });
      setStageMap(newStageMap);
      setStageIdMap(newStageIdMap);
    } else {
      console.error("Expected jobStagesData to be an array, but it is not.");
    }
  }, [jobStagesData]);
  
  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    try {
      let currentStatus: string = "default status";
      let applicationId: string = "default id";
      let candidateName: string = "default candidate name";
        
      Object.keys(trackerData).forEach(status => {
        const candidate = trackerData[status]?.candidates.find(c => c.id === candidateId);
        if (candidate) {
          currentStatus = status;
          applicationId = candidate.applicationId;
          candidateName = candidate.name;
        }
      });
  
      if (!currentStatus || !applicationId || !candidateName) {
        throw new Error(`Candidate with ID ${candidateId} not found in any status.`);
      }
  
      const fromStageId = stageMap[currentStatus];
      const toStageId = stageMap[newStatus];
  
      if (fromStageId === undefined || toStageId === undefined) {
        throw new Error(`Could not find stage ID for current status ${currentStatus} or new status ${newStatus}`);
      }
  
      await moveCandidateMutation.mutateAsync({
        applicationId,
        fromStageId,
        toStageId,
      });
  
      setTrackerData(prevData => {
        const updatedData = { ...prevData };
  
        if (currentStatus && updatedData[currentStatus]) {
          updatedData[currentStatus].candidates = updatedData[currentStatus].candidates.filter(c => c.id !== candidateId);
        }
  
        if (newStatus) {
          if (!updatedData[newStatus]) {
            updatedData[newStatus] = { candidates: [] };
          }
  
          if (!updatedData[newStatus].candidates.find(c => c.id === candidateId)) {
            updatedData[newStatus].candidates.push({
              id: candidateId,
              name: candidateName,
              applicationId,
            });
          }
        }
  
        return updatedData;
      });
    } catch (error) {
      console.error('Error in handleStatusChange:', error);
      if (error instanceof Error) {
        console.error(`Failed to move candidate: ${error.message}`);
      } else {
        console.error('An unknown error occurred while moving the candidate');
      }
    }
  };
    
  
  const renderCandidate = (candidate: { id: string; name: string; applicationId: string; }, status: string) => (
    <Candidate
      key={candidate.id}
      id={candidate.id}
      initialName={candidate.name}
      initialStatus={status}
      statuses={statuses}
      onStatusChange={handleStatusChange}
    />
  );
  
  if (candidateLoading || jobStagesLoading) return <div>Loading...</div>;
  if (candidateError) return <div>Error fetching candidates: {candidateError.message}</div>;
  if (jobStagesError) return <div>Error fetching job stages: {jobStagesError.message}</div>;

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">
        Recruiter Dashboard for {roleTitle}
      </h2>
      <p>Change candidate statuses using the dropdown menu.</p>
      <section>
        <Tracker
          statuses={statuses}
          renderItem={renderCandidate}
          fetchItems={async () => trackerData}
          onStatusChange={handleStatusChange}
        />
      </section>
    </div>
  );
}
