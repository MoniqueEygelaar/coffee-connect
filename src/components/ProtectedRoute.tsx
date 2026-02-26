import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUserEmail } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import { isAdminEmail } from "@/lib/admin";
interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean; // optional flag
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = getCurrentUserEmail();

    if (!email) {
      toast({
        title: "Access denied",
        description: "Please log in first.",
        variant: "destructive",
      });
      navigate("/", { replace: true });
      return;
    }

    if (adminOnly && !isAdminEmail(email)) {
      toast({
        title: "Access denied",
        description: "You must be an admin to view this page.",
        variant: "destructive",
      });
      navigate("/availability", { replace: true });
      return;
    }

    setLoading(false);
  }, [navigate, adminOnly]);

  if (loading) return null; // or a spinner

  return <>{children}</>;
};

export default ProtectedRoute;
