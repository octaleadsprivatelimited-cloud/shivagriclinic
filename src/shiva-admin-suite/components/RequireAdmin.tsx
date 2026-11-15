import { useAuth } from "@/contexts/AuthProvider";
import { isFirebaseConfigured } from "@/lib/firebase";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";

export function RequireAdmin() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (!isFirebaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-4 rounded-xl border bg-card p-8 shadow-sm">
          <h1 className="text-lg font-semibold">Admin panel unavailable</h1>
          <p className="text-sm text-muted-foreground">
            Google administrator sign-in requires the Shiva Firebase project's{" "}
            <code className="text-xs bg-muted px-1 rounded">VITE_FIREBASE_*</code> configuration and enabled Google provider.
            Add the values to <code className="text-xs bg-muted px-1 rounded">.env.local</code> for localhost, or to the host's
            environment for deployment.
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
          <p className="text-sm text-muted-foreground">Access requires the verified Shiva Google account and its Firebase admin claim. Sign out and choose the authorized account.</p>
          <button type="button" className="text-primary text-sm font-medium underline underline-offset-2" onClick={() => void signOut()}>Sign out</button>
          <div><Link to="/" className="text-primary text-sm font-medium underline underline-offset-2">Back to website</Link></div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
