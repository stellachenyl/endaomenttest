import { queryOptions, useQuery } from '@tanstack/react-query';
import { getEnvOrThrow } from '../../utils/env';
import type { Daf } from '../../utils/endaoment-types';
import './AllDafs.css';
import { useReducer, useEffect, useState } from 'react';
import { DONATE_BOX_ID, DonateBox } from './DonateBox';
import { GRANT_BOX_ID, GrantBox } from './GrantBox';
import { getEndaomentUrls } from '../../utils/endaoment-urls';
import { formatUsdc } from '../../utils/formatUsdc';
import { DafActivityList } from './DafActivityList';

const allDafsQueryOptions = queryOptions({
  queryKey: ['All DAFs'],
  queryFn: async (): Promise<Daf[]> => {
    const response = await fetch(
      `${getEnvOrThrow('SAFE_BACKEND_URL')}/get-dafs`,
      { credentials: 'include' }
    );
    const list = await response.json();

    if (!Array.isArray(list)) {
      throw new Error('Invalid response');
    }

    return list;
  },
});

export const AllDafs = () => {
  const allDafsResponse = useQuery(allDafsQueryOptions);

  const [focusedDaf, setFocusedDaf] = useReducer(
    (_prev: Daf | undefined, nextId: string | undefined) => {
      if (!nextId) return undefined;
      if (!allDafsResponse.data) return undefined;

      const foundDaf = allDafsResponse.data.find((daf) => daf.id === nextId);
      if (!foundDaf) return undefined;
      return foundDaf;
    },
    undefined
  );
  const [isShowingDonateBox, setIsShowingDonateBox] = useState(false);
  const [isShowingGrantBox, setIsShowingGrantBox] = useState(false);
  const [wireInstructions, setWireInstructions] = useState(null);
  const [wireType, setWireType] = useState('domestic');

  useEffect(() => {
    if (focusedDaf) {
      fetchWireInstructions(focusedDaf.id, wireType);
    }
  }, [focusedDaf, wireType]);

  const fetchWireInstructions = async (dafId: string, wireType: string) => {
    try {
      const response = await fetch(`/get-wire-instructions?fundId=${dafId}&type=${wireType}`);
      const data = await response.json();
      setWireInstructions(data);  // Set wire instructions in state
    } catch (error) {
      console.error('Error fetching wire instructions:', error);
    }
  };

  const handleDonate = (id: string) => {
    if (!focusedDaf || focusedDaf.id !== id || !isShowingDonateBox) {
      setFocusedDaf(id);
      setIsShowingDonateBox(true);
      document.getElementById(DONATE_BOX_ID)?.scrollIntoView();
    }
    setIsShowingGrantBox(false);
  };
  const handleGrant = (id: string) => {
    if (!focusedDaf || focusedDaf.id !== id || !isShowingGrantBox) {
      setFocusedDaf(id);
      setIsShowingGrantBox(true);
      document.getElementById(GRANT_BOX_ID)?.scrollIntoView();
    }
    setIsShowingDonateBox(false);
  };
  const handleClose = () => {
    setIsShowingDonateBox(false);
    setIsShowingGrantBox(false);
    setFocusedDaf(undefined);
    setWireInstructions(null);
  };

  const handleWireTypeChange = (type: string) => {
    setWireType(type);
  };

  return (
    <>
      {isShowingDonateBox && focusedDaf && wireInstructions && (
        <DonateBox 
          daf={focusedDaf}
          wireInstructions={wireInstructions}
          onClose={handleClose}
        />
      )}
      {isShowingGrantBox && focusedDaf && (
        <GrantBox daf={focusedDaf} onClose={handleClose} />
      )}
      {allDafsResponse.data && (
        <ul className="daf-list">
          {allDafsResponse.data.map((daf) => (
            <li className="box" key={daf.id}>
              <a href={`${getEndaomentUrls().app}/funds/${daf.id}`}>
                {daf.name}
              </a>
              <p>{daf.description}</p>
              <p>Balance: {formatUsdc(daf.usdcBalance)} USDC</p>
              <div className="daf-buttons">
                <button onClick={() => handleDonate(daf.id)} type="button">
                  Donate
                </button>
                <button
                  onClick={() => handleGrant(daf.id)}
                  type="button"
                  disabled={BigInt(daf.usdcBalance) === 0n}>
                  Grant
                </button>
              </div>
              <DafActivityList dafId={daf.id} />
            </li>
          ))}
        </ul>
      )}
      {/* Wire Type Selector */}
      <div>
        <button onClick={() => handleWireTypeChange('domestic')}>Domestic</button>
        <button onClick={() => handleWireTypeChange('international')}>International</button>
      </div>
    </>
  );
};
