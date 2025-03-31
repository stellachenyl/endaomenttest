import { useMutation } from '@tanstack/react-query';
import type { Daf, WireInstructions } from '../../utils/endaoment-types';
import { getEnvOrThrow } from '../../utils/env';
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { getEndaomentUrls } from '../../utils/endaoment-urls';
import { queryClient } from '../../utils/queryClient';

export const DONATE_BOX_ID = 'donate-box';

// This will handle the fetch of wire instructions from the backend
const fetchWireInstructions = async (dafId: string) => {
  const response = await fetch(`${getEnvOrThrow('SAFE_BACKEND_URL')}/get-wire-instructions?fundId=${dafId}`);
  const data = await response.json();
  return data;
};

// Accept wireInstructions as a prop
export const DonateBox = ({
  daf,
  onClose,
}: {
  daf: Daf;
  onClose: () => void;
}) => {
  const [wireInstructions, setWireInstructions] = useState<WireInstructions | null>(null);
  const [loadingWireInstructions, setLoadingWireInstructions] = useState(true);
  const [errorFetchingWireInstructions, setErrorFetchingWireInstructions] = useState(false);

  // Fetch wire instructions when daf.id is available
  useEffect(() => {
    if (!daf.id) return;

    const fetchData = async () => {
      try {
        setLoadingWireInstructions(true);
        setErrorFetchingWireInstructions(false);

        const data = await fetchWireInstructions(daf.id);
        setWireInstructions(data);
      } catch (error) {
        setErrorFetchingWireInstructions(true);
        console.error('Error fetching wire instructions', error);
      } finally {
        setLoadingWireInstructions(false);
      }
    };

    fetchData();
  }, [daf.id]); // Run the effect when `daf.id` changes

  const {
    mutate: donate,
    isIdle,
    isPending,
    isSuccess,
    isError,
  } = useMutation({
    mutationKey: ['Donate'],
    mutationFn: async (formData: FormData) => {
      const response = await fetch(
        `${getEnvOrThrow('SAFE_BACKEND_URL')}/wire-donation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: formData.get('amount'),
            fundId: daf.id,
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
    donate(new FormData(e.currentTarget));
  };

  return (
    <div className="box" id={DONATE_BOX_ID}>
      <button className="close-button" type="button" onClick={onClose}>
        Close
      </button>
      <h4>
        {'Donate to '}
        <a href={`${getEndaomentUrls().app}/funds/${daf.id}`}>{daf.name}</a>
      </h4>
      <form id="donate-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="amount">Amount in dollars</label>
          <input type="number" id="amount" name="amount" required />
        </div>

        {/* Render wire instructions if available */}
        {loadingWireInstructions && <p>Loading wire instructions...</p>}
        {errorFetchingWireInstructions && <p>Failed to load wire instructions.</p>}
        {wireInstructions && (
          <div>
            <h5>Wire Instructions</h5>
            <p>
              {'Please make sure to wire the donation to account number '}
              <b>{wireInstructions.beneficiary.accountNumber}</b>
              {' at '}
              <b>{wireInstructions.receivingBank.name}</b>
              {' with ABA routing number '}
              <b>{wireInstructions.receivingBank.abaRoutingNumber}</b>.
            </p>
          </div>
        )}

        {isIdle || isError ? (
          <button type="submit">
            {isIdle && 'Donate'}
            {isError && 'Error donating, try again'}
          </button>
        ) : (
          <span>
            {isPending && 'Donating...'}
            {isSuccess && 'Donated!'}
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
