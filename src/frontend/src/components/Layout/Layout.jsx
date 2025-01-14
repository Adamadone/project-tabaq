import { Link, Outlet } from "react-router-dom";
import { RoleGuard } from "../RoleGuard";
import { Login } from "./Login";
import { ProfileAvatar } from "./ProfileAvatar";
import { Icon } from "../Icon";
import { Drawer, DrawerActivator } from "../Drawer";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { SearchBar } from "./SearchBar";

export const Layout = () => {
  const pageLinks = (
    <>
      <Link to="/products" className="btn btn-ghost">
        Produkty
      </Link>
      <Link to="/companies" className="btn btn-ghost">
        Producenti
      </Link>
      <RoleGuard requiredRole="admin">
        <Link to="/admin/users" className="btn btn-ghost">
          Administrace uživatelů
        </Link>
      </RoleGuard>
    </>
  );

  const avatar = (
    <RoleGuard requiredRole="user" fallback={<Login />}>
      <ProfileAvatar />
    </RoleGuard>
  );

  return (
    <Drawer
      content={
        <div className="flex flex-col items-start">
          <div className="w-full flex justify-between items-center">
            <Link to="/" className="btn btn-ghost text-xl">
              TabaQ
            </Link>
            {avatar}
          </div>
          {pageLinks}
        </div>
      }
    >
      <div className="flex justify-center">
        <div className="grow w-screen lg:w-auto max-w-screen-xl px-2 lg:px-20 mt-4">
          <div className="navbar bg-neutral shadow-md rounded-box text-neutral-content">
            <div className="flex gap-6 w-full">
              <div className="items-center flex gap-4">
                <Link to="/" className="btn btn-ghost text-xl">
                  TabaQ
                </Link>
                <div className="hidden lg:flex gap-4">{pageLinks}</div>
              </div>
              <div className="grow">
                <SearchBar />
              </div>
              <div className="hidden lg:block">{avatar}</div>
              <DrawerActivator className="lg:hidden mr-4">
                <Icon>
                  <Bars3Icon />
                </Icon>
              </DrawerActivator>
            </div>
          </div>
          <div className="px-2 py-4 overflow-auto">
            <div className="min-w-fit">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
