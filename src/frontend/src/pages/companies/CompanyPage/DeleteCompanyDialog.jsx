import { useNavigate } from "react-router-dom";
import { useDeleteCompanyMutation } from "../../../api/useDeleteCompanyMutation";
import { Button } from "../../../components/Button";
import { Dialog, DialogActions, DialogTitle } from "../../../components/Dialog";
import { useState } from "react";
import { enqueueSnackbar } from "notistack";

export const DeleteCompanyDialog = ({ isOpen, companyId, onClose }) => {
  const [isHasProductsDialogOpen, setIsHasProductsDialogOpen] = useState(false);
  const { mutate: deleteCompany, isPending: isDeletePending } =
    useDeleteCompanyMutation();
  const navigate = useNavigate();

  const handleDelete = () => {
    deleteCompany(
      { id: companyId },
      {
        onSuccess: () => {
          navigate("/companies");
          enqueueSnackbar("Producent byl úspěšně odstraněn", {
            variant: "success",
          });
        },
        onError: async (res) => {
          const body = await res.json();
          if (res.status === 400 && body === "HAS_PRODUCTS") {
            setIsHasProductsDialogOpen(true);
            return;
          }
          enqueueSnackbar("Něco se pokazilo", { variant: "error" });
        },
      },
    );
  };

  return (
    <>
      <Dialog isOpen={isOpen}>
        <DialogTitle>Odstranění producenta</DialogTitle>
        <p>Toto je nevratná operace</p>
        <DialogActions>
          <Button variant="basic" isLoading={isDeletePending} onClick={onClose}>
            Zrušit
          </Button>
          <Button
            variant="error"
            isLoading={isDeletePending}
            onClick={handleDelete}
          >
            Odstranit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog isOpen={isHasProductsDialogOpen}>
        <DialogTitle>Pro tohoto producenta existují produkty</DialogTitle>
        <p>Nejdříve je odstraňte nebo přesuňte pod jiného producenta</p>
        <DialogActions>
          <Button
            variant="primary"
            onClick={() => setIsHasProductsDialogOpen(false)}
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
