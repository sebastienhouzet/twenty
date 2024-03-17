import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isPersistingViewComponentState = createComponentState<boolean>({
  key: 'isPersistingViewComponentState',
  defaultValue: false,
});
