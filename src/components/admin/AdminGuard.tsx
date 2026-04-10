import { Navigate } from "react-router-dom";

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const token = sessionStorage.getItem("admin_token");
  if (!token) return <Navigate to="/ctrl-qx-99" replace />;
  return <>{children}</>;
};

export default AdminGuard;
