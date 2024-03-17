import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { usePersistView } from '@/views/hooks/internal/usePersistView';
import { useUnsavedViewFiltersAndViewSorts } from '@/views/hooks/internal/useUnsavedViewFiltersAndViewSorts';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { GraphQLView } from '@/views/types/GraphQLView';
import { ViewField } from '@/views/types/ViewField';
import { isDefined } from '~/utils/isDefined';

import { ViewScopeInternalContext } from '../scopes/scope-internal-context/ViewScopeInternalContext';

export const useViewBar = (viewBarComponentId?: string) => {
  const componentId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    viewBarComponentId,
  );

  const {
    currentViewIdState,
    availableFieldDefinitionsState,
    availableSortDefinitionsState,
    availableFilterDefinitionsState,
    entityCountInCurrentViewState,
    viewObjectMetadataIdState,
    viewEditModeState,
  } = useViewStates(componentId);
  const setCurrentViewId = useSetRecoilState(currentViewIdState());
  const setAvailableFieldDefinitions = useSetRecoilState(
    availableFieldDefinitionsState(),
  );
  const setAvailableSortDefinitions = useSetRecoilState(
    availableSortDefinitionsState(),
  );
  const setAvailableFilterDefinitions = useSetRecoilState(
    availableFilterDefinitionsState(),
  );
  const setEntityCountInCurrentView = useSetRecoilState(
    entityCountInCurrentViewState(),
  );
  const setViewObjectMetadataId = useSetRecoilState(
    viewObjectMetadataIdState(),
  );

  const { createView, removeView, updateView } =
    usePersistView(viewBarComponentId);

  const {
    upsertUnsavedViewFilter,
    upsertUnsavedViewSort,
    removeUnsavedViewFilter,
    removeUnsavedViewSort,
  } = useUnsavedViewFiltersAndViewSorts(viewBarComponentId);

  const resetViewBar = () => {};

  const updateCurrentView = useRecoilCallback(
    ({ snapshot }) =>
      async (view: Partial<GraphQLView>) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdState())
          .getValue();
        if (isDefined(currentViewId)) {
          await updateView({ ...view, id: currentViewId });
        }
      },
    [updateView, currentViewIdState],
  );

  const upsertViewFields = (_fields: ViewField[]) => {};

  return {
    componentId,
    createView,
    removeView,
    updateView,
    updateCurrentView,
    resetViewBar,
    upsertUnsavedViewSort,
    removeUnsavedViewSort,
    upsertUnsavedViewFilter,
    removeUnsavedViewFilter,
    upsertViewFields,
    setCurrentViewId,
    setAvailableFieldDefinitions,
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setEntityCountInCurrentView,
    setViewObjectMetadataId,
    viewEditModeState,
  };
};
