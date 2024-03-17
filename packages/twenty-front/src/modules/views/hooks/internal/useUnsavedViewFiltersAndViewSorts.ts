import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { ViewScopeInternalContext } from '@/views/scopes/scope-internal-context/ViewScopeInternalContext';
import { unsavedViewFiltersComponentState } from '@/views/states/unsavedViewFiltersComponentState';

export const useUnsavedViewFiltersAndViewSorts = (
  viewBarComponentId?: string,
) => {
  const componentId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    viewBarComponentId,
  );

  const upsertUnsavedViewSort = (_sort: Sort) => {};
  const removeUnsavedViewSort = (_fieldMetadataId: string) => {};
  const upsertUnsavedViewFilter = useRecoilCallback(
    ({ snapshot, set }) =>
      async (upsertedFilter: Filter) => {
        const currentUnsavedViewFilters = getSnapshotValue(
          snapshot,
          unsavedViewFiltersComponentState({ scopeId: componentId }),
        );

        const isFilterAlreadyPresent = currentUnsavedViewFilters.some(
          (viewFilter) =>
            viewFilter.fieldMetadataId === upsertedFilter.fieldMetadataId,
        );

        if (isFilterAlreadyPresent) {
          const updatedFilters = currentUnsavedViewFilters.map((viewFilter) =>
            viewFilter.fieldMetadataId === upsertedFilter.fieldMetadataId
              ? { ...viewFilter, ...upsertedFilter }
              : viewFilter,
          );

          set(
            unsavedViewFiltersComponentState({ scopeId: componentId }),
            updatedFilters,
          );
        } else {
          set(unsavedViewFiltersComponentState({ scopeId: componentId }), [
            ...currentUnsavedViewFilters,
            { ...upsertedFilter, id: v4() },
          ]);
        }
      },
    [componentId],
  );
  const removeUnsavedViewFilter = (_fieldMetadataId: string) => {};

  return {
    upsertUnsavedViewSort,
    removeUnsavedViewSort,
    upsertUnsavedViewFilter,
    removeUnsavedViewFilter,
  };
};
