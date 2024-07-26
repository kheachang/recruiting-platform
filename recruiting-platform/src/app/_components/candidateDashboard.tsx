import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Role } from "./role";
import { Tracker } from "./tracker";
import Link from "next/link";

interface Application {
  id: string;
  jobs: { id: string; name: string }[];
  status: string;
  last_activity_at: string;
  current_stage: { id: string; name: string };
}

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  applications: Application[];
}

interface Job {
  id: string;
  name: string;
  requisition_id: string;
  status: string;
  departments: { id: string; name: string }[];
  offices: { id: string; name: string }[];
  custom_fields: { salary_range: { min_value: string; max_value: string; unit: string } };
}

export function CandidateDashboard({ candidateId }: { candidateId: string }) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [roles, setRoles] = useState<Job[]>([]);

  const getCandidate = api.item.getCandidateById.useQuery({ id: candidateId });
  const getJob = api.item.getJobById.useQuery({ id: "4280628007" }); // hard-coded job ID

  useEffect(() => {
    if (getCandidate.data) {
      setCandidate(getCandidate.data);
    } else if (getCandidate.error) {
      console.error("Error fetching candidate:", getCandidate.error);
    }
  }, [getCandidate.data, getCandidate.error]);

  useEffect(() => {
    if (getJob.data) {
      setRoles([getJob.data]); // dealing with 1 job for now 
    } else if (getJob.error) {
      console.error("Error fetching job:", getJob.error);
    }
  }, [getJob.data, getJob.error]);

  const getMostRecentApplication = (jobId: string) => {
    const applicationsForJob = candidate?.applications.filter(app => 
      app.jobs.some(job => job.id === jobId)
    ) || [];
    return applicationsForJob.reduce((mostRecent, app) => 
      new Date(app.last_activity_at) > new Date(mostRecent.last_activity_at) ? app : mostRecent, 
      applicationsForJob[0]
    );
  };

  const unAppliedRoles = roles.filter(role => {
    const mostRecentApplication = getMostRecentApplication(role.id);
    return !mostRecentApplication || !mostRecentApplication.current_stage.name;
  });

  const fetchItems = async () => {
    return roles.map(role => {
      const mostRecentApplication = getMostRecentApplication(role.id);
      return {
        id: role.id,
        roleStatuses: mostRecentApplication ? [{
          roleId: role.id,
          status: mostRecentApplication.current_stage.name,
        }] : []
      };
    });
  };

  if (getCandidate.isLoading || getJob.isLoading) {
    return <div>Loading...</div>;
  }

  if (!candidate) {
    return <div>No candidate found</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Candidate Dashboard for {candidate.first_name} {candidate.last_name}</h2>
      <section>
        <h3 className="text-2xl font-semibold mb-4">Submit Application To:</h3>
        <div className="grid grid-cols-1 gap-4">
          {unAppliedRoles.length > 0 ? (
            unAppliedRoles.map(role => (
              <div key={role.id} className="mb-4">
                <Role
                  id={parseInt(role.id, 10)}
                  initialTitle={role.name}
                />
                <Link
                  href={`/apply/${role.id}`}
                  className="btn mt-3"
                >
                  Apply for this Role
                </Link>
              </div>
            ))
          ) : (
            <p>No roles available to apply for.</p>
          )}
        </div>
      </section>
      <section className="mb-10">
        <h3 className="text-2xl font-semibold mb-4">Track Your Applications:</h3>
        <p>Drag and drop your applications as they progress through the stages.</p>
        <div className="grid grid-cols-1 gap-4">
          <Tracker
            statuses={["Applied", "Application Review", "Offer", "Rejected"]}
            renderItem={(item) => (
              <Role
                key={item.id}
                id={parseInt(item.id, 10)}
                initialTitle={roles.find(role => role.id === item.id)?.name || "Unknown"}
              />
            )}
            fetchItems={fetchItems}
          />
        </div>
      </section>
    </div>
  );
}
