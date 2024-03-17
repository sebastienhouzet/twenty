import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { AddObjectFilterFromDetailsButton } from '@/object-record/object-filter-dropdown/components/AddObjectFilterFromDetailsButton';
import { ObjectFilterDropdownScope } from '@/object-record/object-filter-dropdown/scopes/ObjectFilterDropdownScope';
import { FiltersHotkeyScope } from '@/object-record/object-filter-dropdown/types/FiltersHotkeyScope';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { EditableFilterDropdownButton } from '@/views/components/EditableFilterDropdownButton';
import { EditableSortChip } from '@/views/components/EditableSortChip';
import { ViewBarFilterEffect } from '@/views/components/ViewBarFilterEffect';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useViewBar } from '@/views/hooks/useViewBar';

export type ViewBarDetailsProps = {
  hasFilterButton?: boolean;
  rightComponent?: ReactNode;
  filterDropdownId?: string;
  viewBarId: string;
};

const StyledBar = styled.div`
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: row;
  height: 40px;
  justify-content: space-between;
  z-index: 4;
`;

const StyledChipcontainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 40px;
  justify-content: space-between;
  margin-left: ${({ theme }) => theme.spacing(2)};
  overflow-x: auto;
`;

const StyledCancelButton = styled.button`
  background-color: inherit;
  border: none;
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-left: auto;
  margin-right: ${({ theme }) => theme.spacing(2)};
  padding: ${(props) => {
    const horiz = props.theme.spacing(2);
    const vert = props.theme.spacing(1);
    return `${vert} ${horiz} ${vert} ${horiz}`;
  }};
  user-select: none;

  &:hover {
    background-color: ${({ theme }) => theme.background.tertiary};
    border-radius: ${({ theme }) => theme.spacing(1)};
  }
`;

const StyledFilterContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledSeperatorContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledSeperator = styled.div`
  align-self: stretch;
  background: ${({ theme }) => theme.background.quaternary};
  width: 1px;
`;

const StyledAddFilterContainer = styled.div`
  margin-left: ${({ theme }) => theme.spacing(1)};
  z-index: 5;
`;

export const ViewBarDetails = ({
  hasFilterButton = false,
  rightComponent,
  filterDropdownId,
}: ViewBarDetailsProps) => {
  const {
    canPersistViewSelector,
    unsavedViewFiltersState,
    unsavedViewSortsState,
    isViewBarExpandedState,
  } = useViewStates();

  const isViewBarExpanded = useRecoilValue(isViewBarExpandedState());
  const canPersistView = useRecoilValue(canPersistViewSelector());
  const unsavedViewFilters = useRecoilValue(unsavedViewFiltersState());
  const unsavedViewSorts = useRecoilValue(unsavedViewSortsState());

  console.log(unsavedViewFilters);

  const { resetViewBar } = useViewBar();

  const handleCancelClick = () => {
    resetViewBar();
  };

  const shouldExpandViewBar =
    canPersistView ||
    ((unsavedViewSorts?.length || unsavedViewFilters?.length) &&
      isViewBarExpanded);

  if (!shouldExpandViewBar) {
    return null;
  }

  return (
    <StyledBar>
      <StyledFilterContainer>
        <StyledChipcontainer>
          {unsavedViewSorts?.map((sort) => (
            <EditableSortChip key={sort.id} viewSort={sort} />
          ))}
          {!!unsavedViewSorts?.length && !!unsavedViewFilters?.length && (
            <StyledSeperatorContainer>
              <StyledSeperator />
            </StyledSeperatorContainer>
          )}
          {unsavedViewFilters?.map((viewFilter) => (
            <ObjectFilterDropdownScope
              key={viewFilter.id}
              filterScopeId={viewFilter.fieldMetadataId}
            >
              <DropdownScope dropdownScopeId={viewFilter.fieldMetadataId}>
                <ViewBarFilterEffect
                  filterDropdownId={viewFilter.fieldMetadataId}
                />
                <EditableFilterDropdownButton
                  viewFilter={viewFilter}
                  hotkeyScope={{
                    scope: FiltersHotkeyScope.ObjectFilterDropdownButton,
                  }}
                  viewFilterDropdownId={viewFilter.fieldMetadataId}
                />
              </DropdownScope>
            </ObjectFilterDropdownScope>
          ))}
        </StyledChipcontainer>
        {hasFilterButton && (
          <StyledAddFilterContainer>
            <AddObjectFilterFromDetailsButton
              filterDropdownId={filterDropdownId}
            />
          </StyledAddFilterContainer>
        )}
      </StyledFilterContainer>
      {canPersistView && (
        <StyledCancelButton
          data-testid="cancel-button"
          onClick={handleCancelClick}
        >
          Reset
        </StyledCancelButton>
      )}
      {rightComponent}
    </StyledBar>
  );
};
