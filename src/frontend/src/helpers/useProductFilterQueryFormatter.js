import { useMemo } from "react";

function formatRatingFilter(ratingFilter) {
  const formatedRatingFilter = {};

  if (
    !ratingFilter.gt &&
    !ratingFilter.gte &&
    !ratingFilter.lt &&
    !ratingFilter.lte
  )
    return formatRatingFilter;

  switch (Object.keys(ratingFilter)[0]) {
    case "gt":
      formatedRatingFilter.minRating = (
        Number.parseInt(ratingFilter.gt) + 0.1
      ).toString();
      formatedRatingFilter.maxRating = "5";
      break;
    case "gte":
      formatedRatingFilter.minRating = ratingFilter.gte.toString();
      formatedRatingFilter.maxRating = "5";
      break;
    case "lt":
      formatedRatingFilter.minRating = "0";
      formatedRatingFilter.maxRating = (
        Number.parseInt(ratingFilter.lt) - 0.1
      ).toString();
      break;
    case "lte":
      formatedRatingFilter.minRating = "0";
      formatedRatingFilter.maxRating = ratingFilter.lte.toString();
      break;
    default:
      formatedRatingFilter.minRating = "0";
      formatedRatingFilter.maxRating = "5";
  }

  return formatedRatingFilter;
}

export function useProductFilterQuerryFormatter(filter) {
  const formatedFilter = useMemo(() => {
    if (!filter) return undefined;

    const formatedFilterQuery = {};

    if (filter.tags && filter.tags.in && Array.isArray(filter.tags.in)) {
      formatedFilterQuery.hasTags = filter.tags.in.join(",");
    }

    if (filter.rating) {
      const { minRating, maxRating } = formatRatingFilter(filter.rating);

      formatedFilterQuery.minRating = minRating;
      formatedFilterQuery.maxRating = maxRating;
    }

    return formatedFilterQuery;
  }, [filter]);

  return formatedFilter;
}
