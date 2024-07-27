import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Tracker } from "./tracker";
import { Candidate } from "./candidate";
import { NavBar } from "./navbar";

type RecruiterDashboardProps = {
  roleId: string;
  roleTitle: string;
};

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
    if (jobStagesData) {
      const stageNames = jobStagesData.map((stage: any) => stage.name);
      setStatuses(stageNames);

      const newStageMap: { [key: string]: number } = {};
      const newStageIdMap: { [key: number]: string } = {};
      jobStagesData.forEach((stage: any) => {
        newStageMap[stage.name] = stage.id;
        newStageIdMap[stage.id] = stage.name;
      });
      setStageMap(newStageMap);
      setStageIdMap(newStageIdMap);
    }
  }, [jobStagesData]);

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    console.log('handleStatusChange called with:', { candidateId, newStatus });
    console.log('Current trackerData:', trackerData);
    console.log('Current stageMap:', stageMap);
    console.log('Current stageIdMap:', stageIdMap);

    try {
      let currentStatus: string | undefined;
      let applicationId: string | undefined;
      let candidateName: string | undefined;

      Object.keys(trackerData).forEach(status => {
        const candidate = trackerData[status]?.candidates.find(candidate => candidate.id === candidateId);
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
      let toStageId: number;
      let newStatusName: string;

      if (stageMap[newStatus]) {
        toStageId = stageMap[newStatus];
        newStatusName = newStatus;
      } else {
        throw new Error(`Invalid new status: ${newStatus}`);
      }

      if (fromStageId === undefined || toStageId === undefined) {
        throw new Error(`Could not find stage ID for current status ${currentStatus} or new status ${newStatus}`);
      }

      console.log('Moving candidate:', { applicationId, fromStageId, toStageId });

      await moveCandidateMutation.mutateAsync({
        applicationId,
        fromStageId,
        toStageId,
      });

      setTrackerData(prevData => {
        const updatedData = { ...prevData };
        updatedData[currentStatus].candidates = updatedData[currentStatus].candidates.filter(c => c.id !== candidateId);
        
        if (!updatedData[newStatusName]) {
          updatedData[newStatusName] = { candidates: [] };
        }
        updatedData[newStatusName].candidates.push({ 
          id: candidateId, 
          name: candidateName,
          applicationId 
        });
        
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
