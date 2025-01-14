import { Dialog, DialogActions, DialogTitle } from "../../../components/Dialog";
import { TextInput } from "../../../components/TextInput";
import { Button } from "../../../components/Button";
import { useState } from "react";
import { Textarea } from "../../../components/Textarea";

export const CompanyDialog = ({
  isOpen,
  title,
  defaultData = { name: "", description: "" },
  isPending,
  submitText,
  onClose,
  onSubmit,
}) => {
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    const description = e.target.description.value;
    const nameError = name === "" ? "Jméno je povinné" : undefined;

    if (nameError) {
      setErrors({
        name: nameError,
      });
      return;
    }

    setErrors({});
    onSubmit({
      name,
      description,
    });
  };

  return (
    <Dialog isOpen={isOpen}>
      <DialogTitle>{title}</DialogTitle>
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <TextInput
          name="name"
          label="Název"
          className="form-control"
          error={errors.name}
          defaultValue={defaultData.name}
        />
        <Textarea
          name="description"
          label="Popis"
          defaultValue={defaultData.description}
        />
        <DialogActions>
          <Button variant="basic" isLoading={isPending} onClick={onClose}>
            Zrušit
          </Button>
          <Button type="submit" isLoading={isPending}>
            {submitText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
