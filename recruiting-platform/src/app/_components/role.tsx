"use client";

import { useState } from "react";

// TODO: remove this? 
type RoleProps = {
  id: number;
  initialTitle: string;
  initialCompany: string;
};

export function Role({ id, initialTitle, initialCompany }: RoleProps) {
  const [title] = useState(initialTitle);
  const [company] = useState(initialCompany);

  return (
    <div className="card-compact bg-base-100 w-96 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{company}</h2>
        <p>{title}</p>
      </div>
    </div>
  );
}