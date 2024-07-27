"use client";

import { useEffect, useState } from "react";

type TrackerProps = {
  statuses: string[];
  renderItem: (item: any) => JSX.Element;
  fetchItems: () => Promise<{ [key: string]: { candidates: { id: string; name: string }[] } }>;
  onStatusChange: (candidateId: string, newStatus: string) => Promise<void>;
};

export function Tracker({ statuses, renderItem, fetchItems, onStatusChange }: TrackerProps) {
  const [itemsByStatus, setItemsByStatus] = useState<{ [key: string]: { candidates: { id: string; name: string }[] } }>({});

  useEffect(() => {
    (async () => {
      const fetchedItems = await fetchItems();
      setItemsByStatus(fetchedItems);
    })();
  }, [fetchItems]);

  const getItemsByStatus = (status: string) => {
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