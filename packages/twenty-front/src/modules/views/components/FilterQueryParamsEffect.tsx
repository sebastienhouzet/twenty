import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useFiltersFromQueryParams } from '@/views/hooks/internal/useFiltersFromQueryParams';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useViewBar } from '@/views/hooks/useViewBar';

export const FilterQueryParamsEffect = () => {
  const { hasFiltersQueryParams, getFiltersFromQueryParams } =
    useFiltersFromQueryParams();
  const { unsavedViewFiltersState } = useViewStates();
  const setCurrentViewFilters = useSetRecoilState(unsavedViewFiltersState());
  const { resetViewBar } = useViewBar();

  useEffect(() => {
    if (!hasFiltersQueryParams) return;

    getFiltersFromQueryParams().then((filtersFromParams) => {
      if (Array.isArray(filtersFromParams)) {
        setCurrentViewFilters(filtersFromParams);
      }
    });

    return () => {
      resetViewBar();
    };
  }, [
    getFiltersFromQueryParams,
    hasFiltersQueryParams,
    resetViewBar,
    setCurrentViewFilters,
  ]);

  return null;
};
