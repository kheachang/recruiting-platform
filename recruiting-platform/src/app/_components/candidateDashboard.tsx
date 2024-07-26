"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Role } from "./role";
import { Tracker } from "./tracker";
import Link from "next/link";

export function CandidateDashboard({ candidateId }: { candidateId: string }) {
  const [candidate, setCandidate] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);

  const getCandidate = api.item.getCandidateById.useQuery({ id: candidateId });
  const getRoles = api.item.getAllRoles.useQuery();

  useEffect(() => {
    if (getCandidate.data) {
      setCandidate(getCandidate.data);
    } else if (getCandidate.error) {
      console.error("Error fetching candidate:", getCandidate.error);
    }
  }, [getCandidate.data, getCandidate.error]);

  useEffect(() => {
    if (getRoles.data) {
      setRoles(getRoles.data.map((role: any) => ({
        id: role.id.toString(),
        name: role.name,
        company: role.company,
      })));
    } else if (getRoles.error) {
      console.error("Error fetching roles:", getRoles.error);
    }
  }, [getRoles.data, getRoles.error]);

  const unAppliedRoles = roles.filter(role =>
    !candidate?.roleStatuses.some((rs: any) => rs.roleId === role.id)
  );

  const fetchItems = async () => {
    return roles.map(role => ({
      id: role.id,
      roleStatuses: candidate?.roleStatuses.filter(roleStatuses => roleStatuses.roleId === role.id) || []
    }));
  };

  if (getCandidate.isLoading) {
    return <div>Loading...</div>;
  }

  if (!candidate) {
    return <div>No candidate found</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Candidate Dashboard for {candidate.name}</h2>
      <section>
        <h3 className="text-2xl font-semibold mb-4">Submit Application To:</h3>
        <div className="grid grid-cols-1 gap-4">
          {unAppliedRoles.length > 0 ? (
            unAppliedRoles.map(role => (
              <div key={role.id} className="mb-4">
                <Role
                  id={parseInt(role.id, 10)}
                  initialTitle={role.name}
                  initialCompany={role.company}
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
            statuses={["Applied", "Phone Screen", "Onsite", "Offer"]}
            renderItem={(item) => (
              <Role
                key={item.id}
                id={parseInt(item.id, 10)}
                initialTitle={roles.find(role => role.id === item.id)?.name || "Unknown"}
                initialCompany={roles.find(role => role.id === item.id)?.company || "Unknown"}
              />
            )}
            fetchItems={fetchItems}
          />
        </div>
      </section>
    </div>
  );
}