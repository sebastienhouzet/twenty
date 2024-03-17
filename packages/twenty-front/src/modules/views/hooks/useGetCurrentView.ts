import { useRecoilValue } from 'recoil';

import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { ViewScopeInternalContext } from '@/views/scopes/scope-internal-context/ViewScopeInternalContext';
import { GraphQLView } from '@/views/types/GraphQLView';

export const useGetCurrentView = (viewBarComponentId?: string) => {
  const componentId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    viewBarComponentId,
  );

  const { records: views } = usePrefetchedData<GraphQLView>(
    PrefetchKey.AllViews,
  );

  const { currentViewIdState, viewObjectMetadataIdState } =
    useViewStates(componentId);

  const currentViewId = useRecoilValue(currentViewIdState());
  const viewObjectMetadataId = useRecoilValue(viewObjectMetadataIdState());

  const currentView = views.find(
    (view) =>
      view.id === currentViewId ||
      (view.key === 'INDEX' && view.objectMetadataId === viewObjectMetadataId),
  );

  const viewsOnCurrentObject = views.filter(
    (view) => view.objectMetadataId === viewObjectMetadataId,
  );

  return {
    componentId,
    currentView,
    views: viewsOnCurrentObject,
  };
};
