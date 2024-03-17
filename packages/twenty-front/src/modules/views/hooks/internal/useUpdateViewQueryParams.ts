import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useUpdateViewQueryParams = () => {
  const [_, setSearchParams] = useSearchParams();

  const changeViewInUrl = useCallback(
    (viewId: string) => {
      setSearchParams((previousSearchParams) => {
        previousSearchParams.set('view', viewId);
        return previousSearchParams;
      });
    },
    [setSearchParams],
  );

  return {
    changeViewInUrl,
  };
};
