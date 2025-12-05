import React, { type FC } from "react";
import { Navigate } from "react-router-dom";
import { PATH } from "../constants/path";

export interface ProtectedRouteProps {
  isAuth: boolean;
  children: React.ReactNode;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  isAuth,
}) => {
  if (!isAuth) {
    return <Navigate to={PATH.Login} />;
  } else {
    return <>{children}</>;
  }
};
