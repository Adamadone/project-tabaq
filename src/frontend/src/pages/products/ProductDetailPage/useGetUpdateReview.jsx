import { useQueryClient } from "@tanstack/react-query";
import { getReviewsQueryKey } from "../../../api/useReviewsQuery";

export const useGetUpdateReview = () => {
  const queryClient = useQueryClient();

  const updateReview = ({ productId, reviewId, updater }) =>
    queryClient.setQueryData(getReviewsQueryKey(productId), (prev) => {
      if (!prev) return;

      const mappedPages = prev.pages.map((page) => {
        const mappedReviews = page.reviews.map((review) => {
          if (review.id !== reviewId) return review;

          return updater(review);
        });
        return {
          ...page,
          reviews: mappedReviews,
        };
      });

      return { ...prev, pages: mappedPages };
    });
  return updateReview;
};
