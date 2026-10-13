import React, { useEffect, useState } from "react";
import logoWithText from "../../../assets/images/LogoWithText/logoWithText.svg";
import { Icon } from "@iconify/react";
import Breadcrumb from "./Breadcrumb";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { userRoleMapper } from "../../interfaces/User.interface";

type MenuItem = {
  icon: string;
  name: string;
  path: string;
};

export default function RootLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  //get name and user_role
  const { user, logout } = useAuth();
  const name = `${user?.name ?? ""} ${user?.surname?.[0] ?? ""}.`;
  const user_role =
    user && user.user_role ? userRoleMapper[user.user_role] : "";

  const locationPath = "/" + location.pathname.split("/")[1];

  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(() => {
    return localStorage.getItem("isSidebarVisible") === "true";
  });

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("isSidebarVisible", String(isSidebarVisible));
  }, [isSidebarVisible]);

  // Menu Item for side bar
  const menuItems: MenuItem[] = [
    {
      icon: "basil:add-outline",
      name: "Create Job",
      path: "/create-job",
    },
    {
      icon: "ic:round-dashboard",
      name: "Dashboard",
      path: "/dashboard",
    },
  ];

  const handleToggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  return (
    <div className="h-screen">
      {/* Nav bar */}
      <nav className="fixed top-0 z-50 h-[4.5rem] w-full items-center bg-white border-b border-gray-200">
        <div className="flex flex-row h-full items-center space-x-9">
          <div className="flex items-center h-full w-[299px] min-w-[299px] justify-center bg-gray-50">
            <img src={logoWithText} alt="Logo" />
            <button
              type="button"
              onClick={handleToggleSidebar}
              aria-label="Toggle Sidebar"
            >
              <Icon
                icon="mdi:hamburger-menu"
                className="text-pep-blue size-11"
              />
            </button>
          </div>

          {/* Nav bar - right side */}
          <div className="flex flex-row h-full grow items-center">
            {/* Breadcrumb */}
            <Breadcrumb />

            {/* User Icon */}
            <div className="flex flex-row items-center min-w-fit h-full bg-gray-50 rounded-b-xl px-5 space-x-4 m-auto">
              <Icon
                id="go-to-account-management"
                icon="ph:user"
                className="size-11 rounded-full p-2.5 text-white bg-pep-orange hover:cursor-pointer"
                onClick={() => navigate("/account-management")}
              />
              <div className="flex flex-col">
                {user ? (
                  <>
                    <p>{name}</p>
                    <p className="text-xs">{user_role}</p>
                  </>
                ) : (
                  <div className="flex flex-col space-y-1.5 animate-pulse">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                    <div className="h-3 w-16 rounded bg-gray-200" />
                  </div>
                )}
              </div>
              <Icon
                icon="mingcute:exit-door-fill"
                className="text-pep-blue size-[45px] hover:cursor-pointer"
                onClick={logout}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Side bar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen pt-[4.5rem] transition-transform ${
          isSidebarVisible ? "w-64 translate-x-0" : "-translate-x-full"
        } bg-white `}
        aria-label="Sidebar"
      >
        <div className="h-full w-[299px] overflow-y-auto bg-gray-50 py-14 px-4">
          <ul className="space-y-9 w-fit">
            {menuItems.map(({ icon, name, path }) => (
              <Link
                key={name}
                to={path}
                className={`flex items-center py-2 px-4 space-x-2.5 rounded-[999px] ${
                  locationPath === path
                    ? "bg-pep-blue text-white"
                    : "text-black"
                } group`}
              >
                <Icon icon={icon} className="size-6" />
                <span className="ms-3">{name}</span>
              </Link>
            ))}
          </ul>
        </div>
      </aside>

      {/* Children */}
      <div
        className={`min-w-fit h-screen ${
          isSidebarVisible ? "pt-[4.5rem] pl-[299px]" : "pt-[4.5rem]"
        }`}
      >
        <div className="px-9 py-12 h-full">{children}</div>
      </div>
    </div>
  );
}
