import { useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { GraphQLView } from '@/views/types/GraphQLView';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined } from '~/utils/isDefined';

type ViewBarEffectProps = {
  viewBarId: string;
};

export const ViewBarEffect = ({ viewBarId }: ViewBarEffectProps) => {
  const { currentView } = useGetCurrentView(viewBarId);
  const { onCurrentViewChangeState, currentViewIdState } =
    useViewStates(viewBarId);

  const [currentViewSnapshot, setCurrentViewSnapshot] = useState<
    GraphQLView | undefined
  >(undefined);
  const onCurrentViewChange = useRecoilValue(onCurrentViewChangeState());
  const setCurrentViewId = useSetRecoilState(currentViewIdState());

  useEffect(() => {
    if (!isDeeplyEqual(currentView, currentViewSnapshot)) {
      setCurrentViewSnapshot(currentView);
      onCurrentViewChange?.(currentView);
    }
  }, [currentView, currentViewSnapshot, onCurrentViewChange]);

  useEffect(() => {
    if (isDefined(currentView)) {
      setCurrentViewId(currentView.id);
    }
  }, [currentView, setCurrentViewId]);

  return <></>;
};
