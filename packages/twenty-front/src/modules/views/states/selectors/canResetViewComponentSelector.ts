import { selectorFamily } from 'recoil';

import { unsavedViewFiltersComponentState } from '@/views/states/unsavedViewFiltersComponentState';
import { unsavedViewSortsComponentState } from '@/views/states/unsavedViewSortsComponentState';

export const canResetViewComponentSelector = selectorFamily({
  key: 'canResetViewComponentSelector',
  get:
    ({ scopeId }: { scopeId: string }) =>
    ({ get }) => {
      return (
        get(unsavedViewSortsComponentState({ scopeId })).length === 0 &&
        get(unsavedViewFiltersComponentState({ scopeId })).length === 0
      );
    },
});
