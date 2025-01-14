import { useCallback, useState } from "react";
import { Button } from "../../../components/Button";
import { useProductQuery } from "../../../api/useProductQuery";
import { Link, useParams } from "react-router-dom";
import { DynamicContent } from "../../../components/DynamicContent";
import { Card, CardSubTitle, CardTitle } from "../../../components/Card";
import { CardRating } from "../../../components/CardRating";
import { StarRating } from "../../../components/StarRating";
import { RoleGuard } from "../../../components/RoleGuard";
import { ProductDialog } from "../components/EditProductDialog";
import { DeleteProductDialog } from "./DeleteProductDialog";
import { useProductEditMutation } from "../../../api/useProductEditMutation";
import { CreateReviewForm } from "./CreateReviewForm";
import { enqueueSnackbar } from "notistack";
import { useReviewsQuery } from "../../../api/useReviewsQuery.js";
import { InfiniteScroll } from "../../../components/InfiniteScroll.jsx";
import { Spinner } from "../../../components/Spinner.jsx";
import { Review } from "./Review.jsx";
import { CreateCommentDialog } from "./CreateCommentDialog.jsx";
import { useQueryClient } from "@tanstack/react-query";
import { getProductsQueryKey } from "../../../api/useProductsQuery";
import { useMyReviewQuery } from "../../../api/useMyReviewQuery.js";
import { useAuthContext } from "../../../providers/AuthProvider.jsx";
import { useCompaniesQuery } from "../../../api/useCompaniesQuery.js";
import { Tag } from "../../../components/Tag.jsx";

export const ProductDetailPage = () => {
  const productId = useParams().id;

  const productQuery = useProductQuery(productId);

  const queryClient = useQueryClient();

  const { user } = useAuthContext();

  const reviewsQuery = useReviewsQuery({ productId: productId });

  const myReviewQuery = useMyReviewQuery(productId, !!user);

  const companiesQuery = useCompaniesQuery({ resultCount: 100 });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [creatingCommentForReviewId, setCreatingCommentForReviewId] =
    useState(null);

  const { mutate: editProduct, isPending: isEditPending } =
    useProductEditMutation();

  const handleEditSubmit = (formData, onSuccess) => {
    editProduct(
      { productId: productId, ...formData },
      {
        onSuccess: async () => {
          setIsEditDialogOpen(false);
          await onSuccess(productId);
          enqueueSnackbar(`Produkt byl úspěšně upraven`, {
            variant: "success",
          });
          queryClient.invalidateQueries({
            exact: false,
            queryKey: getProductsQueryKey().slice(0, 1),
          });
        },
        onError(error) {
          enqueueSnackbar(
            `Při úpravě produktu došlo k chybě: ${error.message}` +
              { variant: "error" },
          );
        },
      },
    );
  };

  const loadMoreReviews = () => {
    if (reviewsQuery.hasNextPage) {
      reviewsQuery.fetchNextPage();
    }
  };

  const handleScrollEndReached = useCallback(() => {
    loadMoreReviews();
  }, [loadMoreReviews]);

  const renderReviews = (reviewsResponse) => {
    const joinedReviews = [].concat(
      ...reviewsResponse.pages.map((page) => page.reviews),
    );

    return (
      <>
        <CreateCommentDialog
          productId={productId}
          reviewId={creatingCommentForReviewId}
          onClose={() => setCreatingCommentForReviewId(null)}
        />
        <InfiniteScroll
          onScrollEndReached={handleScrollEndReached}
          disabled={
            reviewsQuery.isFetchingNextPage || !reviewsQuery.hasNextPage
          }
        >
          <div className="mt-2 flex flex-col gap-4">
            <h2 className="font-bold text-xl mt-4">Recenze:</h2>
            {joinedReviews.map((review) => (
              <Review
                key={review.id}
                productId={productId}
                review={review}
                onCreateComment={() => setCreatingCommentForReviewId(review.id)}
              />
            ))}
          </div>
        </InfiniteScroll>
        {reviewsQuery.isFetchingNextPage && <Spinner />}
      </>
    );
  };

  const renderContent = (product) => {
    return (
      <>
        <ProductDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          defaultValues={product}
          onSubmit={handleEditSubmit}
          title="Upravit produkt"
          submitText="Uložit"
          isPending={isEditPending}
          companies={companiesQuery.data?.pages[0]?.results ?? []}
        />
        <DeleteProductDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        />

        <div className="flex flex-col gap-4">
          <Card className="h-full text-left">
            <div className="flex flex-wrap md:flex-nowrap gap-4">
              <div className="grow md:grow-0 flex justify-center md:justify-start shrink-0">
                <img
                  className="w-64 h-64 object-cover rounded-lg"
                  src={`${import.meta.env.VITE_API_URL}/products/${product.id}/image`}
                />
              </div>
              <div className="grow">
                <div className="box sm:flex justify-between">
                  <div>
                    <CardTitle>{product.title}</CardTitle>
                    <Link to={`/companies/${product.company.id}`}>
                      <CardSubTitle className="hover:underline">
                        {product.company.name}
                      </CardSubTitle>
                    </Link>
                  </div>
                  <div>
                    <div className="mt-2 sm:mt-0 flex gap-2 items-center">
                      {product.averageRating === 0 ? (
                        <>
                          <div className="flex items-center">Bez hodnocení</div>
                          <StarRating rating={1} />
                        </>
                      ) : (
                        <>
                          {product.averageRating}
                          <StarRating rating={product.averageRating} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Tag key={tag.id} title={tag.name} />
                  ))}
                </div>
                <div className="mt-4">{product.description}</div>
              </div>
            </div>
            <div className="flex mb-4 gap-4">
              <div className="grow"></div>
              <div className="flex justify-right gap-4">
                <RoleGuard requiredRole="admin">
                  <Button
                    variant="error"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </Button>
                  <Button onClick={() => setIsEditDialogOpen(true)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                      />
                    </svg>
                  </Button>
                </RoleGuard>
              </div>
            </div>
          </Card>

          <RoleGuard
            requiredRole="user"
            fallback={
              <Card className="h-full text-center">
                <CardTitle>
                  Prosím, přihlaste se, abyste mohli napsat recenzi.
                </CardTitle>
              </Card>
            }
          >
            {myReviewQuery.data ? (
              <Review
                productId={productId}
                review={myReviewQuery.data}
                isUserReview
              />
            ) : (
              <CreateReviewForm productId={productId} />
            )}
          </RoleGuard>

          <DynamicContent
            {...reviewsQuery}
            renderContent={renderReviews}
            disabledLoadingWhenFetchingNextPage
          />
        </div>
      </>
    );
  };

  return <DynamicContent {...productQuery} renderContent={renderContent} />;
};
