"use client";

import { useState } from "react";

type RoleStatus = {
  roleId: string;
  status: string;
};

type CandidateProps = {
  id: string;
  initialName: string;
  roleStatuses: RoleStatus[];
};

export function Candidate({ id, initialName, roleStatuses = [] }: CandidateProps) {
  const [name] = useState(initialName);

  return (
    <div className="card-compact bg-base-100 w-96 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{name}</h2>
        <ul>
          {roleStatuses.map((rs) => (
            <li key={rs.roleId} className="mb-2">
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}