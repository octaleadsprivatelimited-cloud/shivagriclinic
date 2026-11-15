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
  GoogleAuthProvider,
  onIdTokenChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type IdTokenResult,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

const ADMIN_EMAIL = "shivaagriclinic@gmail.com";

function isVerifiedGoogleAdmin(user: User, token: IdTokenResult): boolean {
  const provider = token.claims.firebase as { sign_in_provider?: unknown } | undefined;
  return token.claims.admin === true &&
    token.claims.email === ADMIN_EMAIL &&
    token.claims.email_verified === true &&
    provider?.sign_in_provider === "google.com" &&
    user.email?.toLowerCase() === ADMIN_EMAIL;
}

type AuthContextValue = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: () => Promise<void>;
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
        setIsAdmin(isVerifiedGoogleAdmin(u, result));
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

  const signIn = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error(
        "Firebase is not configured. In Vercel, add all VITE_FIREBASE_* variables from .env.example and redeploy.",
      );
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ login_hint: ADMIN_EMAIL, prompt: "select_account" });
    const credential = await signInWithPopup(auth, provider);
    let token: Awaited<ReturnType<typeof getIdTokenResult>>;
    try {
      token = await getIdTokenResult(credential.user, true);
    } catch {
      await firebaseSignOut(auth);
      throw new Error("Could not verify administrator access. Please try signing in again.");
    }
    if (!isVerifiedGoogleAdmin(credential.user, token)) {
      await firebaseSignOut(auth);
      throw new Error("Access is limited to the verified Shiva Google account with the administrator claim. Sign in with shivaagriclinic@gmail.com after the site owner grants that claim.");
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
