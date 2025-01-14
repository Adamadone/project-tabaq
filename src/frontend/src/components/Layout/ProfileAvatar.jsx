import { useMsal } from "@azure/msal-react";
import { Button } from "../Button";
import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/solid";
import { useAuthContext } from "../../providers/AuthProvider";
import { Dropdown } from "../Dropdown";

export const ProfileAvatar = () => {
  const auth = useAuthContext();

  const initials = auth.name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .join(" ")
    .toUpperCase();

  return (
    <Dropdown
      items={[
        <Button onClick={auth.logout}>
          <ArrowLeftEndOnRectangleIcon className="size-5" />
          Odhlásit
        </Button>,
      ]}
      horizontalPosition="left"
      isUncontrolled
    >
      <button className="rounded-full size-10 overflow-hidden bg-secondary text-primary-content flex justify-center items-center">
        {initials}
      </button>
    </Dropdown>
  );
};
