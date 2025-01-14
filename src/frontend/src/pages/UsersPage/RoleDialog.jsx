import { useState } from "react";
import {
  DialogActions,
  DialogTitle,
  DialogWithData,
} from "../../components/Dialog";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { useChangeRoleMutation } from "../../api/useChangeRoleMutation";
import { capitalize } from "../../helpers/capitalize";
import { useQueryClient } from "@tanstack/react-query";

export const RoleDialog = ({ user, onClose }) => {
  return (
    <DialogWithData
      data={user}
      render={(user) => <RoleDialogContent user={user} onClose={onClose} />}
    />
  );
};

export const RoleDialogContent = ({ user, onClose }) => {
  const [role, setRole] = useState(user.role.toLowerCase());

  const { mutate: changeRole, isPending: isChangeRolePending } =
    useChangeRoleMutation();
  const queryClient = useQueryClient();

  const handleSubmit = () => {
    changeRole(
      {
        userId: user.id,
        role: capitalize(role),
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries();
          onClose();
        },
        onError: () => alert("Něco se pokazilo"),
      },
    );
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  return (
    <>
      <DialogTitle>{`Změna role pro ${user?.name}`}</DialogTitle>
      <Select
        value={role}
        options={[
          { id: "admin", name: "Admin" },
          { id: "user", name: "Uživatel" },
        ]}
        onChange={handleRoleChange}
      />
      <DialogActions>
        <Button
          variant="basic"
          isLoading={isChangeRolePending}
          onClick={onClose}
        >
          Zrušit
        </Button>
        <Button isLoading={isChangeRolePending} onClick={handleSubmit}>
          Uložit
        </Button>
      </DialogActions>
    </>
  );
};
