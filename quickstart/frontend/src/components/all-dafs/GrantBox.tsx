import type { Daf, OrgListing } from '../../utils/endaoment-types';
import { useSearch } from '../../utils/useSearch';
import { useState, type FormEvent } from 'react';
import './GrantBox.css';
import { useMutation } from '@tanstack/react-query';
import { getEnvOrThrow } from '../../utils/env';
import { getEndaomentUrls } from '../../utils/endaoment-urls';
import { queryClient } from '../../utils/queryClient';

export const GRANT_BOX_ID = 'grant-box';

export const GrantBox = ({
  daf,
  onClose,
}: {
  daf: Daf;
  onClose: () => void;
}) => {
  const {
    searchTerm,
    setSearchTerm,
    submitSearch,
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
  } = useSearch();

  const [selectedOrg, setSelectedOrg] = useState<OrgListing | undefined>();

  const {
    mutate: grant,
    isIdle,
    isPending,
    isSuccess,
    isError,
  } = useMutation({
    mutationKey: ['Donate'],
    mutationFn: async (formData: FormData) => {
      const response = await fetch(
        `${getEnvOrThrow('SAFE_BACKEND_URL')}/grant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: formData.get('amount'),
            fundId: daf.id,
            orgId: formData.get('orgId'),
            purpose: 'General Grant',
          }),
          credentials: 'include',
        }
      );

      return response.json();
    },
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: ['Daf Activity'],
      });
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedOrg) return;
    grant(new FormData(e.currentTarget));
  };

  return (
    <div className="box" id={GRANT_BOX_ID}>
      <button className="close-button" type="button" onClick={onClose}>
        Close
      </button>
      <h4>
        {'Grant from '}
        <a href={`${getEndaomentUrls().app}/funds/${daf.id}`}>{daf.name}</a>
      </h4>
      <form id="grant-form" onSubmit={handleSubmit}>
        <div className="box org-select">
          <label>
            {selectedOrg
              ? 'Granting to'
              : 'Search and Select an Org to grant to'}
          </label>
          {selectedOrg ? (
            <>{selectedOrg.name}</>
          ) : (
            <>
              <div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.currentTarget.value)}
                  onBlur={submitSearch}
                />
                <button onClick={submitSearch}>Search</button>
              </div>
              <div>
                {isLoading ? (
                  <span>Loading...</span>
                ) : (
                  data?.pages.map((page) =>
                    page.map((org) => (
                      <button
                        type="button"
                        onClick={() => setSelectedOrg(org)}
                        key={org.ein ?? org.id}
                        className="org-listing">
                        {org.name}
                      </button>
                    ))
                  )
                )}
                {hasNextPage &&
                  (isFetchingNextPage ? (
                    <span>Loading...</span>
                  ) : (
                    <button
                      onClick={() => fetchNextPage()}
                      type="button"
                      className="load-more-button">
                      Load More
                    </button>
                  ))}
              </div>
            </>
          )}
          <input
            name="orgId"
            hidden
            readOnly
            value={selectedOrg && selectedOrg.id ? selectedOrg.id : ''}
          />
        </div>
        <div>
          <label htmlFor="amount">Amount in dollars</label>
          <input type="number" id="amount" name="amount" />
        </div>

        {isIdle || isError ? (
          <button type="submit">
            {isIdle && 'Grant'}
            {isError && 'Error granting, try again'}
          </button>
        ) : (
          <span>
            {isPending && 'Granting...'}
            {isSuccess && 'Granted!'}
          </span>
        )}
        {isSuccess && (
          <>
            <br />
            <a
              href={`${getEndaomentUrls().app}/funds/${daf.id}`}
              className="view-fund-link">
              View on Endaoment
            </a>
          </>
        )}
      </form>
    </div>
  );
};
