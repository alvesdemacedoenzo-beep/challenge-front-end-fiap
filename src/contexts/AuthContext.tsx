import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getCurrentAccount } from "../services/api";
import type { AccountUser } from "../services/api";

type AuthContextValue = {
  user: AccountUser | null;
  setUser: (user: AccountUser | null) => void;
  isLoading: boolean;
  errorMessage: string;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    getCurrentAccount()
      .then((account) => {
        if (active) {
          setUser(account);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setUser(null);
          setErrorMessage(
            cause instanceof Error
              ? cause.message
              : "Não foi possível verificar sua sessão.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, errorMessage }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
