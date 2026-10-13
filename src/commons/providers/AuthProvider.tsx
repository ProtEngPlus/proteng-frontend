import { createContext, ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getMe, login as loginApi, logout as logoutApi } from "../api/auth";
import { SESSION_EXPIRED_EVENT } from "../api/client";
import { User } from "../interfaces/User.interface";

const PUBLIC_ROUTES = [
  "/",
  "/sign-in",
  "/sign-up",
  "/forget-password",
  "/reset-password",
  "/sent-reset-password-email",
  "/sent-verification-email",
  "/success-verified",
];

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  refreshUser: () => void;
  login: (
    email: string,
    password: string,
    role: string,
  ) => Promise<User | null>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(
    sessionStorage.getItem("user")
      ? JSON.parse(sessionStorage.getItem("user") as string)
      : null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (PUBLIC_ROUTES.includes(location.pathname)) {
      return;
    }

    setLoading(true);
    getMe()
      .then((response) => {
        setLoading(false);
        if (!response) {
          return;
        }
        if (response.code !== 200 || !response.data) {
          setUser(null);
          sessionStorage.removeItem("user");
          navigate("/sign-in");
          return;
        }
        const { access_token: _access_token, ...userData } = response.data;
        setUser(userData as User);
        sessionStorage.setItem("user", JSON.stringify(userData));
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
        logout();
        navigate("/sign-in");
      });
  }, [location.pathname]);

  useEffect(() => {
    const onSessionExpired = () => {
      setUser(null);
      sessionStorage.removeItem("user");
      if (!PUBLIC_ROUTES.includes(location.pathname)) {
        navigate("/sign-in");
      }
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
  }, [location.pathname, navigate]);

  const login = async (email: string, password: string, role: string) => {
    setLoading(true);
    const response = await loginApi(email, password, role);
    if (response.code !== 200 || !response.data) {
      setLoading(false);
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { access_token, ...userData } = response.data;
    setUser(userData as User);
    sessionStorage.setItem("user", JSON.stringify(userData));
    setLoading(false);
    return userData as User;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setUser(null);
      navigate("/sign-in");
    }
  };

  const refreshUser = async () => {
    const res = await getMe();
    if (res.code !== 200 || !res.data) {
      return;
    }
    setUser({ ...user, ...res.data });
    sessionStorage.setItem("user", JSON.stringify({ ...user, ...res.data }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        refreshUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
