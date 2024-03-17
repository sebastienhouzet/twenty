import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { useUnsavedViewFiltersAndViewSorts } from '@/views/hooks/internal/useUnsavedViewFiltersAndViewSorts';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { isDefined } from '~/utils/isDefined';

type ViewBarFilterEffectProps = {
  filterDropdownId: string;
};

export const ViewBarFilterEffect = ({
  filterDropdownId,
}: ViewBarFilterEffectProps) => {
  const { availableFilterDefinitionsState } = useViewStates();
  const { upsertUnsavedViewFilter } = useUnsavedViewFiltersAndViewSorts();
  // console.log(upsertUnsavedViewFilter);

  const availableFilterDefinitions = useRecoilValue(
    availableFilterDefinitionsState(),
  );
  const { setAvailableFilterDefinitions, setOnFilterSelect } =
    useFilterDropdown({ filterDropdownId });

  useEffect(() => {
    if (isDefined(availableFilterDefinitions)) {
      setAvailableFilterDefinitions(availableFilterDefinitions);
    }

    setOnFilterSelect(() => (filter: Filter | null) => {
      if (isDefined(filter)) {
        upsertUnsavedViewFilter(filter);
      }
    });
  }, [
    availableFilterDefinitions,
    setOnFilterSelect,
    setAvailableFilterDefinitions,
    upsertUnsavedViewFilter,
  ]);

  // const currentViewFilters = useRecoilValue(currentViewFiltersState);

  // useEffect(() => {
  //   if (filterDefinitionUsedInDropdown?.type === 'RELATION') {
  //     const viewFilterUsedInDropdown = currentViewFilters.find(
  //       (filter) =>
  //         filter.fieldMetadataId ===
  //         filterDefinitionUsedInDropdown.fieldMetadataId,
  //     );

  //     const viewFilterSelectedRecordIds = isNonEmptyString(
  //       viewFilterUsedInDropdown?.value,
  //     )
  //       ? JSON.parse(viewFilterUsedInDropdown.value)
  //       : [];

  //     setObjectFilterDropdownSelectedRecordIds(viewFilterSelectedRecordIds);
  //   } else if (filterDefinitionUsedInDropdown?.type === 'SELECT') {
  //     const viewFilterUsedInDropdown = currentViewFilters.find(
  //       (filter) =>
  //         filter.fieldMetadataId ===
  //         filterDefinitionUsedInDropdown.fieldMetadataId,
  //     );

  //     const viewFilterSelectedOptionValues = isNonEmptyString(
  //       viewFilterUsedInDropdown?.value,
  //     )
  //       ? JSON.parse(viewFilterUsedInDropdown.value)
  //       : [];

  //     setObjectFilterDropdownSelectedOptionValues(
  //       viewFilterSelectedOptionValues,
  //     );
  //   }
  // }, [
  //   filterDefinitionUsedInDropdown,
  //   currentViewFilters,
  //   setObjectFilterDropdownSelectedRecordIds,
  //   isObjectFilterDropdownUnfolded,
  //   setObjectFilterDropdownSelectedOptionValues,
  // ]);

  return <></>;
};
