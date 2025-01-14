import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardSubTitle, CardTitle } from "../../../components/Card";
import { RoleGuard } from "../../../components/RoleGuard";
import { Button } from "../../../components/Button";
import { CardRating } from "../../../components/CardRating";
import { useProductCreateMutation } from "../../../api/useProductCreateMutation";
import {
  getProductsQueryKey,
  useProductsQuery,
} from "../../../api/useProductsQuery";
import { ProductDialog } from "../components/EditProductDialog";
import { useCompaniesQuery } from "../../../api/useCompaniesQuery";
import { DynamicContent } from "../../../components/DynamicContent";
import { enqueueSnackbar } from "notistack";
import { StarRating } from "../../../components/StarRating";
import { Pagination } from "../../../components/Pagination";
import { useQueryClient } from "@tanstack/react-query";
import { TagsPicker } from "./TagsPicker";
import { Tag } from "../../../components/Tag";
import { ProductsList } from "../../../components/ProductsList";
import { ProductsFilter } from "../../../components/ProductsFilter.jsx";
import { useProductFilterQuerryFormatter } from "../../../helpers/useProductFilterQueryFormatter.js";

export const ProductsPage = () => {
  const queryClient = useQueryClient();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentFilter, setCurrentFilter] = useState({});

  const formatedFilter = useProductFilterQuerryFormatter(currentFilter);
  const companiesQuery = useCompaniesQuery({ resultCount: 100 });

  const { mutate, isPending } = useProductCreateMutation();

  const handleSubmit = (formData, onSuccess) => {
    mutate(formData, {
      onSuccess: async (data) => {
        setIsCreateDialogOpen(false);
        await onSuccess(data.id);
        enqueueSnackbar(`Produkt byl vytvořen`, { variant: "success" });
        queryClient.invalidateQueries({
          exact: false,
          queryKey: getProductsQueryKey().slice(0, 1),
        });
      },
      onError() {
        enqueueSnackbar("Něco se pokazilo", { variant: "error" });
      },
    });
  };

  return (
    <>
      <ProductDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        companies={companiesQuery.data?.pages[0]?.results ?? []}
        title="Vytvořit produkt"
        onSubmit={handleSubmit}
        submitText="Vytvořit"
        isPending={isPending}
      />

      <RoleGuard requiredRole="admin">
        <div className="flex justify-center mb-4">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Přidat produkt
          </Button>
        </div>
      </RoleGuard>
      <ProductsFilter
        onFilterSave={(filter) => {
          setCurrentFilter(filter);
        }}
        className={"bg-secondary-content"}
      ></ProductsFilter>
      <ProductsList className={"mt-4"} filter={formatedFilter} />
    </>
  );
};
