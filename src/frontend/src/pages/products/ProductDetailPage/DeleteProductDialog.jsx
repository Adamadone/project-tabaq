import { useParams, useNavigate } from "react-router-dom";
import { useProductDeleteMutation } from "../../../api/useProductDeleteMutation";
import { Button } from "../../../components/Button";
import { Dialog, DialogTitle } from "../../../components/Dialog";
import { enqueueSnackbar } from "notistack";

export const DeleteProductDialog = ({ isOpen, onClose }) => {
  const { mutate, isPending } = useProductDeleteMutation();
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSubmit = () => {
    mutate(
      { productId: id },
      {
        onSuccess: () => {
          navigate("/products");
          enqueueSnackbar("Produkt byl smazán", { variant: "success" });
        },
        onError: (error) => {
          enqueueSnackbar(
            `Při smazání produktu došlo k chybě: ${error.message}` +
              { variant: "error" },
          );
        },
      },
    );
  };

  return (
    <Dialog isOpen={isOpen}>
      <DialogTitle>Opravdu si přejete smazat tento produkt?</DialogTitle>
      <div className="flex justify-end gap-4">
        <Button variant="basic" onClick={onClose}>
          Ne
        </Button>
        <Button variant="error" isLoading={isPending} onClick={handleSubmit}>
          Ano
        </Button>
      </div>
    </Dialog>
  );
};
