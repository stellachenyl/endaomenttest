import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';
import type { Daf, WireInstructions } from '../../utils/endaoment-types';
import { getEnvOrThrow } from '../../utils/env';
import type { FormEvent } from 'react';
import { getEndaomentUrls } from '../../utils/endaoment-urls';
import { queryClient } from '../../utils/queryClient';

export const DONATE_BOX_ID = 'donate-box';

const getWireInstructionsQueryOptions = queryOptions({
  queryKey: ['Wire Instructions'],
  queryFn: async (): Promise<WireInstructions> => {
    const response = await fetch(
      `${getEnvOrThrow('SAFE_BACKEND_URL')}/wire-donation`,
      {
        credentials: 'include',
      }
    );
    return response.json();
  },
});

export const DonateBox = ({
  daf,
  onClose,
}: {
  daf: Daf;
  onClose: () => void;
}) => {
  const { data: wireInstructions } = useQuery(getWireInstructionsQueryOptions);
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
          <input type="number" id="amount" name="amount" />
        </div>
        <p>
          {'Please make sure to wire the same amount to account #'}
          <b>{wireInstructions?.beneficiary.accountNumber}</b>
          {' at '}
          <b>{wireInstructions?.receivingBank.name}</b>
          {' with ABA routing #'}
          <b>{wireInstructions?.receivingBank.abaRoutingNumber}</b>
        </p>

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
