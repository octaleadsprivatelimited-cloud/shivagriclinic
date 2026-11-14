import { useAuth } from "@/contexts/AuthProvider";
import { isFirebaseConfigured } from "@/lib/firebase";
import { isLocalChannelPreview } from "@/hooks/useChannelContent";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";

export function RequireAdmin() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  // Local editing is available only on loopback in Vite dev mode. Production
  // always requires Firebase Authentication and Firestore rules.
  if (!isFirebaseConfigured() && isLocalChannelPreview()) return <Outlet />;

  if (!isFirebaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-4 rounded-xl border bg-card p-8 shadow-sm">
          <h1 className="text-lg font-semibold">Admin panel unavailable</h1>
          <p className="text-sm text-muted-foreground">
            Firebase environment variables are missing. In Vercel open{" "}
            <strong>Project → Settings → Environment Variables</strong> and add every{" "}
            <code className="text-xs bg-muted px-1 rounded">VITE_FIREBASE_*</code> key from{" "}
            <code className="text-xs bg-muted px-1 rounded">.env.example</code>. Apply to{" "}
            <strong>Production</strong>, then redeploy.
          </p>
          <Link to="/" className="text-primary text-sm font-medium underline underline-offset-2">
            Back to website
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md space-y-4 rounded-xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold">Administrator access required</h1>
          <p className="text-sm text-muted-foreground">This Firebase account is signed in but does not have the admin claim. Ask the site owner to grant access, then sign out and sign in again.</p>
          <button type="button" className="text-primary text-sm font-medium underline underline-offset-2" onClick={() => void signOut()}>Sign out</button>
          <div><Link to="/" className="text-primary text-sm font-medium underline underline-offset-2">Back to website</Link></div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
