import { useRecoilCallback } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { GraphQLView } from '@/views/types/GraphQLView';

import { ViewScopeInternalContext } from '../../scopes/scope-internal-context/ViewScopeInternalContext';

export const usePersistView = (viewBarComponentId?: string) => {
  const _componentId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    viewBarComponentId,
  );

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const createView = useRecoilCallback(
    () => async (_view: GraphQLView) => {
      return;
    },
    [],
  );

  const updateView = useRecoilCallback(
    () => async (view: Partial<GraphQLView>) => {
      if (!view.id) {
        throw new Error('View ID is required to update a view.');
      }

      await updateOneRecord({
        idToUpdate: view.id,
        updateOneRecordInput: {
          id: view.id,
          name: view.name,
          isCompact: view.isCompact,
        },
      });
    },
    [updateOneRecord],
  );

  const removeView = useRecoilCallback(
    () => async () => {
      return;
    },
    [],
  );

  return {
    createView,
    updateView,
    removeView,
  };
};
