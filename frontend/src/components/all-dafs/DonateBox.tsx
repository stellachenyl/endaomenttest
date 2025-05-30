import { useMutation } from '@tanstack/react-query';
import type { Daf, WireInstructions } from '../../utils/endaoment-types';
import { getEnvOrThrow } from '../../utils/env';
import type { FormEvent } from 'react';
import { getEndaomentUrls } from '../../utils/endaoment-urls';
import { queryClient } from '../../utils/queryClient';
import { useState } from 'react';

export const DONATE_BOX_ID = 'donate-box';

// Accept wireInstructions as a prop
export const DonateBox = ({
  daf,
  onClose,
  wireInstructions, // Add wireInstructions prop here
}: {
  daf: Daf;
  onClose: () => void;
  wireInstructions: WireInstructions | null; // Include wireInstructions in the type definition
}) => {
  const [donationPledgeId, setDonationPledgeId] = useState<string | null>(null);

  const {
    mutate: donate,
    isIdle,
    isPending,
    isSuccess,
    isError: donationError,
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

      const result = await response.json();

      if (result.id) {
        setDonationPledgeId(result.id);
      }

      return result;
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
        {wireInstructions ? (
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
        ) : (
          <p>Loading wire instructions...</p>
        )}

        {isIdle || donationError ? (
          <button type="submit">
            {isIdle && 'Donate'}
            {donationError && 'Error donating, try again'}
          </button>
        ) : (
          <span>
            {isPending && 'Donating...'}
            {isSuccess && 'Donated!'}
          </span>
        )}

        {isSuccess && donationPledgeId && (
          <>
            <div>
              <h1>Donation Successful!</h1>
              <p>Your donation has been successfully processed.</p>
              <p>Donation ID: {donationPledgeId}</p>
            </div>
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
