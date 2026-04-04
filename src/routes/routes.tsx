import {
  Routes as MainRouter,
  Route,
  BrowserRouter,
  Navigate,
} from "react-router-dom";
import { PATH } from "../shared/constants/path";
import { useContext, type FC } from "react";
import { Header } from "../shared/header/header";
import { AppContext } from "../shared/context/app-context";
import { AuthPage, LoginPage, MainPage, ProfilePage } from "../pages";
import { NewsPage } from "../pages/news-page/news-page";
import { ProtectedRoute } from "./protected-route";
export const Routes: FC = () => {
  const { authUserId, isAuthLoading } = useContext(AppContext);

  if (isAuthLoading) return null;

  return (
    <BrowserRouter>
      <Header />
      <main>
        <MainRouter>
          <Route
            path={PATH.Auth}
            element={authUserId ? <Navigate to={PATH.Home} replace /> : <AuthPage />}
          />
          <Route
            path={PATH.Login}
            element={authUserId ? <Navigate to={PATH.Home} replace /> : <LoginPage />}
          />

          <Route
            path={PATH.Home}
            element={
              <ProtectedRoute isAuth={Boolean(authUserId)}>
                <NewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATH.Map}
            element={
              <ProtectedRoute isAuth={Boolean(authUserId)}>
                <MainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATH.Profile}
            element={
              <ProtectedRoute isAuth={Boolean(authUserId)}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to={authUserId ? PATH.Home : PATH.Auth}
                replace
              />
            }
          />
        </MainRouter>
      </main>
    </BrowserRouter>
  );
};
