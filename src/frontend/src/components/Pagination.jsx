import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

export const Pagination = ({
  pageNumber,
  hasNextPage,
  onPreviousClick,
  onNextClick,
}) => {
  const canGoBack = pageNumber > 0;

  return (
    <div className="flex justify-end">
      <div className="join grid grid-cols-2">
        <button
          className="join-item btn btn-square"
          disabled={!canGoBack}
          onClick={onPreviousClick}
        >
          <ChevronLeftIcon className="size-6" />
        </button>
        <button
          className="join-item btn btn-square"
          disabled={!hasNextPage}
          onClick={onNextClick}
        >
          <ChevronRightIcon className="size-6" />
        </button>
      </div>
    </div>
  );
};
