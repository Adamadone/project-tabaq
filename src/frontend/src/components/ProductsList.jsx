import { Link } from "react-router-dom";
import { Card, CardSubTitle, CardTitle } from "./Card";
import { StarRating } from "./StarRating";
import { Tag } from "./Tag";
import { useProductsQuery } from "../api/useProductsQuery";
import { useState } from "react";
import { DynamicContent } from "./DynamicContent";
import { Pagination } from "./Pagination";

export const ProductsList = ({
  companyId,
  filter,
  className,
  productClassNames,
  display = "vertical",
  hasPager = true,
}) => {
  const [pageNumber, setPageNumber] = useState(0);

  const productsQuery = useProductsQuery({ companyId, ...filter });

  let containerClasses = `flex flex-col gap-4 ${className}`;

  if (display === "horizontal") {
    containerClasses = `flex justify-center gap-10 ${className}`;
  }

  const handleNextPageClick = () => {
    setPageNumber((page) => {
      if (productsQuery.data.pages.length <= page + 1)
        productsQuery.fetchNextPage();

      return page + 1;
    });
  };

  const handlePrevPageClick = () => {
    setPageNumber((page) => page - 1);
  };

  const renderContent = (data) => {
    const page = data.pages[pageNumber];
    const hasNextPage = data.pages[pageNumber]?.hasNextPage;

    const mappedProducts = page.results.map((product) => (
      <Link
        className={productClassNames}
        key={product.id}
        to={`/products/${product.id}`}
      >
        <Card className="h-full">
          <div
            className={`box md:flex gap-4 ${display === "horizontal" ? "flex-col" : ""}`}
          >
            <div className="flex justify-center">
              <img
                src={`${import.meta.env.VITE_API_URL}/products/${product.id}/image`}
                alt={product.title}
                className={`h-64 object-cover rounded-lg ${display === "horizontal" ? "" : "md:w-36 md:h-36"}`}
              />
            </div>
            <div className="grow">
              <div
                className={`mt-4 md:mt-0 box sm:flex justify-between ${display === "horizontal" ? "flex-col" : ""}`}
              >
                <div>
                  <CardTitle>{product.title}</CardTitle>
                  <CardSubTitle>{product.company.name}</CardSubTitle>
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
            </div>
          </div>
        </Card>
      </Link>
    ));

    return (
      <>
        <div className={containerClasses}>{mappedProducts}</div>
        {hasPager && (
          <div className="pt-2">
            <Pagination
              pageNumber={pageNumber}
              hasNextPage={hasNextPage}
              onNextClick={handleNextPageClick}
              onPreviousClick={handlePrevPageClick}
            />
          </div>
        )}
      </>
    );
  };

  return <DynamicContent {...productsQuery} renderContent={renderContent} />;
};
