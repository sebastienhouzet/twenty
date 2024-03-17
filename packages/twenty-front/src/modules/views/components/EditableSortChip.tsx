import { IconArrowDown, IconArrowUp } from '@/ui/display/icon/index';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { useViewBar } from '@/views/hooks/useViewBar';
import { ViewSort } from '@/views/types/ViewSort';

type EditableSortChipProps = {
  viewSort: ViewSort;
};

export const EditableSortChip = ({ viewSort }: EditableSortChipProps) => {
  const { removeUnsavedViewSort, upsertUnsavedViewSort } = useViewBar();

  const handleRemoveClick = () => {
    removeUnsavedViewSort(viewSort.fieldMetadataId);
  };

  const handleClick = () => {
    upsertUnsavedViewSort({
      ...viewSort,
      direction: viewSort.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  return (
    <SortOrFilterChip
      key={viewSort.fieldMetadataId}
      testId={viewSort.fieldMetadataId}
      labelValue={viewSort.definition.label}
      Icon={viewSort.direction === 'desc' ? IconArrowDown : IconArrowUp}
      onRemove={handleRemoveClick}
      onClick={handleClick}
    />
  );
};
