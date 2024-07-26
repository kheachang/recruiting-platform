"use client";

import { useState } from "react";

// TODO: remove this? 
type RoleProps = {
  id: number;
  initialTitle: string;
};

export function Role({ id, initialTitle }: RoleProps) {
  const [title] = useState(initialTitle);

  return (
    <div className="card-compact bg-base-100 w-96 shadow-xl">
      <div className="card-body">
        <p>{title}</p>
      </div>
    </div>
  );
}