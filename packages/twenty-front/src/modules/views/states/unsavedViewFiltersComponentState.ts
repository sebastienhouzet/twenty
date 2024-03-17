import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { ViewFilter } from '../types/ViewFilter';

export const unsavedViewFiltersComponentState = createComponentState<
  ViewFilter[]
>({
  key: 'unsavedViewFiltersComponentState',
  defaultValue: [],
});
