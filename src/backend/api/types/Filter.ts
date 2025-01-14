export type TFilterResult<T> = {
  cursor?: string | undefined;
  hasNextPage: boolean;
  results: T[];
};
