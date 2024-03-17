import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { ViewSort } from '../types/ViewSort';

export const unsavedViewSortsComponentState = createComponentState<ViewSort[]>({
  key: 'unsavedViewSortsComponentState',
  defaultValue: [],
});
