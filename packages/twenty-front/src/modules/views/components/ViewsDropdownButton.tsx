import { MouseEvent } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import {
  IconChevronDown,
  IconList,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@/ui/display/icon';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { StyledDropdownButtonContainer } from '@/ui/layout/dropdown/components/StyledDropdownButtonContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MOBILE_VIEWPORT } from '@/ui/theme/constants/MobileViewport';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { VIEWS_DROPDOWN_ID } from '@/views/constants/ViewsDropdownId';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useViewBar } from '@/views/hooks/useViewBar';
import { isDefined } from '~/utils/isDefined';

import { useViewStates } from '../hooks/internal/useViewStates';

const StyledBoldDropdownMenuItemsContainer = styled(DropdownMenuItemsContainer)`
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

const StyledDropdownLabelAdornments = styled.span`
  align-items: center;
  color: ${({ theme }) => theme.grayScale.gray35};
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledViewName = styled.span`
  margin-left: ${({ theme }) => theme.spacing(1)};
  display: inline-block;
  max-width: 130px;
  @media (max-width: 375px) {
    max-width: 90px;
  }
  @media (min-width: 376px) and (max-width: ${MOBILE_VIEWPORT}px) {
    max-width: 110px;
  }
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  white-space: nowrap;
`;

export type ViewsDropdownButtonProps = {
  hotkeyScope: HotkeyScope;
  onViewEditModeChange?: () => void;
  optionsDropdownScopeId: string;
};

export const ViewsDropdownButton = ({
  hotkeyScope,
  onViewEditModeChange,
  optionsDropdownScopeId,
}: ViewsDropdownButtonProps) => {
  const theme = useTheme();

  const { removeView, setCurrentViewId } = useViewBar();
  const { entityCountInCurrentViewState, viewEditModeState } = useViewStates();
  const { currentView, views } = useGetCurrentView();

  const entityCountInCurrentView = useRecoilValue(
    entityCountInCurrentViewState(),
  );

  const setViewEditMode = useSetRecoilState(viewEditModeState());

  const {
    isDropdownOpen: isViewsDropdownOpen,
    closeDropdown: closeViewsDropdown,
  } = useDropdown(VIEWS_DROPDOWN_ID);

  const { openDropdown: openOptionsDropdown } = useDropdown(
    optionsDropdownScopeId,
  );

  const handleViewSelect = useRecoilCallback(
    () => async (viewId: string) => {
      setCurrentViewId(viewId);
      closeViewsDropdown();
    },
    [closeViewsDropdown, setCurrentViewId],
  );

  const handleAddViewButtonClick = () => {
    setViewEditMode('create');
    onViewEditModeChange?.();
    closeViewsDropdown();
    openOptionsDropdown();
  };

  const handleEditViewButtonClick = (
    event: MouseEvent<HTMLButtonElement>,
    viewId: string,
  ) => {
    event.stopPropagation();
    setCurrentViewId(viewId);
    setViewEditMode('edit');
    onViewEditModeChange?.();
    closeViewsDropdown();
    openOptionsDropdown();
  };

  const handleDeleteViewButtonClick = async (
    event: MouseEvent<HTMLButtonElement>,
    _viewId: string,
  ) => {
    event.stopPropagation();

    await removeView();
    closeViewsDropdown();
  };

  const { getIcon } = useIcons();
  const CurrentViewIcon = getIcon(currentView?.icon);

  return (
    <Dropdown
      dropdownId={VIEWS_DROPDOWN_ID}
      dropdownHotkeyScope={hotkeyScope}
      clickableComponent={
        <StyledDropdownButtonContainer isUnfolded={isViewsDropdownOpen}>
          {currentView && CurrentViewIcon ? (
            <CurrentViewIcon size={theme.icon.size.md} />
          ) : (
            <IconList size={theme.icon.size.md} />
          )}
          <StyledViewName>{currentView?.name ?? 'All'}</StyledViewName>
          <StyledDropdownLabelAdornments>
            · {entityCountInCurrentView}{' '}
            <IconChevronDown size={theme.icon.size.sm} />
          </StyledDropdownLabelAdornments>
        </StyledDropdownButtonContainer>
      }
      dropdownComponents={
        <>
          <DropdownMenuItemsContainer>
            {views.map((view) => (
              <MenuItem
                key={view.id}
                iconButtons={[
                  {
                    Icon: IconPencil,
                    onClick: (event: MouseEvent<HTMLButtonElement>) =>
                      handleEditViewButtonClick(event, view.id),
                  },
                  views.length > 1
                    ? {
                        Icon: IconTrash,
                        onClick: (event: MouseEvent<HTMLButtonElement>) =>
                          handleDeleteViewButtonClick(event, view.id),
                      }
                    : null,
                ].filter(isDefined)}
                onClick={() => handleViewSelect(view.id)}
                LeftIcon={getIcon(view.icon)}
                text={view.name}
              />
            ))}
          </DropdownMenuItemsContainer>
          <DropdownMenuSeparator />
          <StyledBoldDropdownMenuItemsContainer>
            <MenuItem
              onClick={handleAddViewButtonClick}
              LeftIcon={IconPlus}
              text="Add view"
            />
          </StyledBoldDropdownMenuItemsContainer>
        </>
      }
    />
  );
};
