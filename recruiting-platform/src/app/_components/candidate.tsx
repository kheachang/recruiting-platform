import { useState, useEffect } from "react";

type CandidateProps = {
  id: string;
  initialName: string;
  initialStatus: string;
  statuses: string[];
  onStatusChange: (candidateId: string, newStatus: string) => Promise<void>;
};

export function Candidate({ id, initialName, initialStatus, statuses, onStatusChange }: CandidateProps) {
  const [status, setStatus] = useState<string>(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value;
    if (newStatus !== status) {
      setStatus(newStatus);
      await onStatusChange(id, newStatus);
    }
  };

  return (
    <div>
      <h3>{initialName}</h3>
      <select value={status} onChange={handleChange}>
        {statuses.map(statusOption => (
          <option key={statusOption} value={statusOption}>
            {statusOption}
          </option>
        ))}
      </select>
    </div>
  );
}