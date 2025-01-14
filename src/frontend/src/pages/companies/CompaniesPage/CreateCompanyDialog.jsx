import { useQueryClient } from "@tanstack/react-query";
import { useCreateCompanyMutation } from "../../../api/useCreateCompanyMutation";
import { CompanyDialog } from "../components/CompanyDialog";
import { COMPANIES_QUERY_KEY } from "../../../api/useCompaniesQuery";
import { enqueueSnackbar } from "notistack";

export const CreateCompanyDialog = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { mutate: createCompany, isPending: isCreateCompanyPending } =
    useCreateCompanyMutation();

  const handleSubmit = (data) => {
    createCompany(data, {
      onSuccess: () => {
        onClose();
        queryClient.invalidateQueries({
          queryKey: COMPANIES_QUERY_KEY,
        });
        enqueueSnackbar("Producent byl vytvořen", { variant: "success" });
      },
      onError: () => enqueueSnackbar("Něco se pokazilo", { variant: "error" }),
    });
  };

  return (
    <CompanyDialog
      isOpen={isOpen}
      title="Vytvořit producenta"
      submitText="Vytvořit"
      isPending={isCreateCompanyPending}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
};
