import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { extractComponentReadOnlySelector } from '@/ui/utilities/state/component-state/utils/extractComponentReadOnlySelector';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { availableFieldDefinitionsComponentState } from '@/views/states/availableFieldDefinitionsComponentState';
import { availableFilterDefinitionsComponentState } from '@/views/states/availableFilterDefinitionsComponentState';
import { availableSortDefinitionsComponentState } from '@/views/states/availableSortDefinitionsComponentState';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { entityCountInCurrentViewComponentState } from '@/views/states/entityCountInCurrentViewComponentState';
import { isPersistingViewComponentState } from '@/views/states/isPersistingViewComponentState';
import { isViewBarExpandedComponentState } from '@/views/states/isViewBarExpandedComponentState';
import { onCurrentViewChangeComponentState } from '@/views/states/onCurrentViewChangeComponentState';
import { canPersistViewComponentSelector } from '@/views/states/selectors/canPersistViewComponentSelector';
import { unsavedViewFiltersComponentState } from '@/views/states/unsavedViewFiltersComponentState';
import { unsavedViewSortsComponentState } from '@/views/states/unsavedViewSortsComponentState';
import { viewEditModeComponentState } from '@/views/states/viewEditModeComponentState';
import { viewObjectMetadataIdComponentState } from '@/views/states/viewObjectMetadataIdComponentState';

import { ViewScopeInternalContext } from '../../scopes/scope-internal-context/ViewScopeInternalContext';

export const useViewStates = (viewComponentId?: string) => {
  const componentId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    viewComponentId,
  );

  return {
    componentId,
    currentViewIdState: extractComponentState(
      currentViewIdComponentState,
      componentId,
    ),
    availableFieldDefinitionsState: extractComponentState(
      availableFieldDefinitionsComponentState,
      componentId,
    ),
    availableFilterDefinitionsState: extractComponentState(
      availableFilterDefinitionsComponentState,
      componentId,
    ),
    availableSortDefinitionsState: extractComponentState(
      availableSortDefinitionsComponentState,
      componentId,
    ),
    canPersistViewSelector: extractComponentReadOnlySelector(
      canPersistViewComponentSelector,
      componentId,
    ),
    isPersistingViewState: extractComponentState(
      isPersistingViewComponentState,
      componentId,
    ),
    isViewBarExpandedState: extractComponentState(
      isViewBarExpandedComponentState,
      componentId,
    ),
    onCurrentViewChangeState: extractComponentState(
      onCurrentViewChangeComponentState,
      componentId,
    ),
    entityCountInCurrentViewState: extractComponentState(
      entityCountInCurrentViewComponentState,
      componentId,
    ),
    viewEditModeState: extractComponentState(
      viewEditModeComponentState,
      componentId,
    ),
    viewObjectMetadataIdState: extractComponentState(
      viewObjectMetadataIdComponentState,
      componentId,
    ),
    unsavedViewFiltersState: extractComponentState(
      unsavedViewFiltersComponentState,
      componentId,
    ),
    unsavedViewSortsState: extractComponentState(
      unsavedViewSortsComponentState,
      componentId,
    ),
  };
};
