import { gql } from '@apollo/client';

import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { capitalize } from '~/utils/string/capitalize';

export const useGenerateFindDuplicateRecordsQuery = () => {
  const mapFieldMetadataToGraphQLQuery = useMapFieldMetadataToGraphQLQuery();

  return ({
    objectMetadataItem,
    depth,
  }: {
    objectMetadataItem: ObjectMetadataItem;
    depth?: number;
  }) => gql`
    query FindDuplicate${capitalize(objectMetadataItem.nameSingular)}($id: ID) {
      ${objectMetadataItem.nameSingular}Duplicates(id: $id){
        edges {
          node {
            id
            ${objectMetadataItem.fields
              .map((field) =>
                mapFieldMetadataToGraphQLQuery({
                  field,
                  maxDepthForRelations: depth,
                }),
              )
              .join('\n')}
          }
          cursor
        }
        pageInfo {
          hasNextPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
  `;
};
