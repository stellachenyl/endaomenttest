import { useQuery } from '@tanstack/react-query';
import { getEnvOrThrow } from '../../utils/env';
import type { DafActivity } from '../../utils/endaoment-types';
import './AllDafs.css';
import { formatUsdc } from '../../utils/formatUsdc';
import { useState } from 'react';
import { formatDate } from '../../utils/formatDate';

const ACTIVITY_TYPE_TO_LABEL: Record<string, string> = {
  pending_grant: 'Pending Grant',
  grant: 'Grant',
  cash_donation_pledge: 'Cash Donation Pledge',
};

export const DafActivityList = ({ dafId }: { dafId: string }) => {
  const dafActivityResponse = useQuery({
    queryKey: ['Daf Activity', dafId],
    queryFn: async (): Promise<DafActivity[]> => {
      const response = await fetch(
        `${getEnvOrThrow('SAFE_BACKEND_URL')}/get-daf-activity?fundId=${dafId}`,
        { credentials: 'include' }
      );
      const list = await response.json();

      if (!Array.isArray(list)) {
        throw new Error('Invalid response');
      }

      return list;
    },
  });

  const [isShowingActivity, setIsShowingActivity] = useState(false);
  const toggleShow = () => setIsShowingActivity((v) => !v);

  return (
    <div className="daf-activity">
      <button type="button" onClick={toggleShow}>
        {isShowingActivity ? 'Hide' : 'Show'} Activity
      </button>
      {isShowingActivity && (
        <>
          {dafActivityResponse.data ? (
            <>
              {dafActivityResponse.data.map((activity) => (
                <div
                  className="daf-activity-item"
                  key={activity.occurredAtUtc + activity.usdcAmount}>
                  <p>Type: {ACTIVITY_TYPE_TO_LABEL[activity.type]}</p>
                  <p>Amount: {formatUsdc(activity.usdcAmount)}</p>
                  <p>At: {formatDate(activity.occurredAtUtc)}</p>
                </div>
              ))}
            </>
          ) : (
            <p>No activity yet</p>
          )}
        </>
      )}
    </div>
  );
};
