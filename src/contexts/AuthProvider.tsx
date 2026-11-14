import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getIdTokenResult,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(() => getFirebaseAuth() !== null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    let current = 0;
    const unsub = onIdTokenChanged(auth, (u) => {
      const version = ++current;
      setLoading(true);
      if (!u) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      void getIdTokenResult(u).then((result) => {
        if (version !== current) return;
        setUser(u);
        setIsAdmin(result.claims.admin === true);
      }).catch(() => {
        if (version !== current) return;
        setUser(u);
        setIsAdmin(false);
      }).finally(() => {
        if (version === current) setLoading(false);
      });
    });
    return () => { current++; unsub(); };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error(
        "Firebase is not configured. In Vercel, add all VITE_FIREBASE_* variables from .env.example and redeploy.",
      );
    }
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    let token: Awaited<ReturnType<typeof getIdTokenResult>>;
    try {
      token = await getIdTokenResult(credential.user, true);
    } catch {
      await firebaseSignOut(auth);
      throw new Error("Could not verify administrator access. Please try signing in again.");
    }
    if (token.claims.admin !== true) {
      await firebaseSignOut(auth);
      throw new Error("This account does not have administrator access. Ask the site owner to grant the admin claim, then sign in again.");
    }
    setUser(credential.user);
    setIsAdmin(true);
    setLoading(false);
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) await firebaseSignOut(auth);
  }, []);

  const value = useMemo(
    () => ({ user, isAdmin, loading, signIn, signOut }),
    [user, isAdmin, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
