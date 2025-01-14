import { Spinner } from "./Spinner";

/**
 * Component that handles all states of fetching data
 * When data is fetche it will call renderContent with the data as a parameter
 */
export const DynamicContent = ({
  data,
  isPending,
  isFetchingNextPage,
  error,
  renderContent,
  disabledLoadingWhenFetchingNextPage = false,
}) => {
  if (isPending || (isFetchingNextPage && !disabledLoadingWhenFetchingNextPage))
    return <Spinner status="primary" />;

  if (error || data === undefined)
    // TODO: make it nicer
    return "Nastala neočekávaná chyba";

  return renderContent(data);
};
