import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  // check if our token is in the browser storage
  let token = localStorage.getItem("shopperpet_token");

  // if there is no token, redirect to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If there is a token, render the child routes
  return <Outlet />;
}

export default ProtectedRoute;