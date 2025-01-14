import { useQueryClient } from "@tanstack/react-query";
import { useUpdateCompanyMutation } from "../../../api/useUpdateCompanyMutation";
import { CompanyDialog } from "../components/CompanyDialog";
import { getCompanyQueryKey } from "../../../api/useCompanyQuery";
import { enqueueSnackbar } from "notistack";

export const UpdateCompanyDialog = ({ isOpen, company, onClose }) => {
  const queryClient = useQueryClient();
  const { mutate: updateCompany, isPending: isUpdateCompanyPending } =
    useUpdateCompanyMutation();

  const handleSubmit = (data) => {
    updateCompany(
      { id: company.id, ...data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getCompanyQueryKey({ id: company.id }),
          });
          onClose();
          enqueueSnackbar("Producent byl upraven", { variant: "success" });
        },
        onError: () =>
          enqueueSnackbar("Něco se pokazilo", { variant: "error" }),
      },
    );
  };

  return (
    <CompanyDialog
      isOpen={isOpen}
      submitText="Upravit"
      title="Úprava producenta"
      defaultData={company}
      isPending={isUpdateCompanyPending}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
};
