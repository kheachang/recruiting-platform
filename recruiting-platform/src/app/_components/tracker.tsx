"use client";

import { useEffect, useState } from "react";

type Candidate = {
  id: string;
  name: string;
  applicationId?: string;
};

type TrackerData = {
  [key: string]: {
    candidates: Candidate[];
  };
};

type TrackerProps = {
  statuses: string[];
  renderItem: (candidate: Candidate, status: string) => JSX.Element;
  fetchItems: () => Promise<TrackerData>;
  onStatusChange: (candidateId: string, newStatus: string) => Promise<void>;
};

export function Tracker({ statuses, renderItem, fetchItems, onStatusChange }: TrackerProps) {
  const [itemsByStatus, setItemsByStatus] = useState<TrackerData>({});

  useEffect(() => {
    (async () => {
      try {
        // @ts-ignore
        const fetchedItems = await fetchItems();
        setItemsByStatus(fetchedItems);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    })();
  }, [fetchItems]);

  const getItemsByStatus = (status: string): Candidate[] => {
    return itemsByStatus[status]?.candidates || [];
  };

  return (
    <div className="flex flex-wrap gap-4 p-4">
      {statuses.map(status => (
        <div
          key={status}
          className="flex-1 min-w-[150px] max-w-[200px] p-4 bg-gray-50 rounded-lg shadow-sm"
        >
          <h3 className="text-sm font-semibold mb-2 truncate">{status}</h3>
          <div className="space-y-2">
            {getItemsByStatus(status).map(candidate => (
              <div
                key={candidate.id}
                className="p-2 bg-white rounded shadow-sm cursor-pointer truncate"
                onClick={() => onStatusChange(candidate.id, status)}
              >
                <div className="text-xs sm:text-sm md:text-base truncate">
                  {renderItem(candidate, status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
