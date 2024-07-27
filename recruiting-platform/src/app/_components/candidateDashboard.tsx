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
    return !mostRecentApplication || mostRecentApplication.status === "rejected";
  });

  const trackerRoles = roles.filter(role => {
    const mostRecentApplication = getMostRecentApplication(role.id);
    return mostRecentApplication && mostRecentApplication.status !== "rejected";
  });

  const fetchItems = async () => {
    return trackerRoles.map(role => {
      const mostRecentApplication = getMostRecentApplication(role.id);
      return {
        id: role.id,
        roleStatuses: mostRecentApplication ? [{
          roleId: role.id,
          status: mostRecentApplication.current_stage.name,
        }] : [],
        metadata: {
          notes: role.notes,
          confidential: role.confidential,
          status: role.status,
          departments: role.departments,
          offices: role.offices,
          hiring_team: role.hiring_team,
          openings: role.openings,
          custom_fields: role.custom_fields,
        }
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
      <section className="mb-6">
        <h3 className="text-2xl font-semibold mb-4">Candidate Details:</h3>
        <div className="mb-4">
          <strong>Company:</strong> {candidate.company}
        </div>
        {candidate.title && (
          <div className="mb-4">
            <strong>Title:</strong> {candidate.title}
          </div>
        )}
        {candidate.phone_numbers.length > 0 && (
          <div className="mb-4">
            <strong>Phone Numbers:</strong>
            <ul>
              {candidate.phone_numbers.map((phone, index) => (
                <li key={index}>{phone.value} ({phone.type})</li>
              ))}
            </ul>
          </div>
        )}
        {candidate.addresses.length > 0 && (
          <div className="mb-4">
            <strong>Addresses:</strong>
            <ul>
              {candidate.addresses.map((address, index) => (
                <li key={index}>{address.value} ({address.type})</li>
              ))}
            </ul>
          </div>
        )}
        {candidate.email_addresses.length > 0 && (
          <div className="mb-4">
            <strong>Email Addresses:</strong>
            <ul>
              {candidate.email_addresses.map((email, index) => (
                <li key={index}>{email.value} ({email.type})</li>
              ))}
            </ul>
          </div>
        )}
        {candidate.website_addresses.length > 0 && (
          <div className="mb-4">
            <strong>Website Addresses:</strong>
            <ul>
              {candidate.website_addresses.map((website, index) => (
                <li key={index}><a href={website.value} target="_blank" rel="noopener noreferrer">{website.value}</a></li>
              ))}
            </ul>
          </div>
        )}
        {candidate.social_media_addresses.length > 0 && (
          <div className="mb-4">
            <strong>Social Media:</strong>
            <ul>
              {candidate.social_media_addresses.map((social, index) => (
                <li key={index}><a href={social.value} target="_blank" rel="noopener noreferrer">{social.value}</a></li>
              ))}
            </ul>
          </div>
        )}
        <div className="mb-4">
          <strong>Tags:</strong> {candidate.tags.join(', ')}
        </div>
      </section>

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
                  href={{
                    pathname: `/apply/${role.id}`,
                    query: { jobData: JSON.stringify(role) }
                  }}
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
        <p>Your tracker will update when there's progress on your application.</p>
        <div className="grid grid-cols-1 gap-4">
          <Tracker
            statuses={["Application Review", "Phone Screen", "Preliminary Phone Screen", "Deep dive", "Rejected"]}
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
