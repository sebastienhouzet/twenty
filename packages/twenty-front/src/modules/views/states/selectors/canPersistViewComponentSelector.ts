import { createComponentReadOnlySelector } from '@/ui/utilities/state/component-state/utils/createComponentReadOnlySelector';
import { unsavedViewFiltersComponentState } from '@/views/states/unsavedViewFiltersComponentState';
import { unsavedViewSortsComponentState } from '@/views/states/unsavedViewSortsComponentState';

export const canPersistViewComponentSelector = createComponentReadOnlySelector({
  key: 'canPersistViewComponentSelector',
  get:
    ({ scopeId }: { scopeId: string }) =>
    ({ get }) => {
      return (
        get(unsavedViewSortsComponentState({ scopeId })).length > 0 ||
        get(unsavedViewFiltersComponentState({ scopeId })).length > 0
      );
    },
});
