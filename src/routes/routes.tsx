import { Routes as MainRouter, Route, BrowserRouter } from "react-router-dom";
import { PATH } from "../constants/path";
import type { FC } from "react";
import { Header } from "../shared/header/header";
import { AuthPage, LoginPage, MainPage, ProfilePage } from "../pages";
export const Routes: FC = () => {
  // const initData = window.Telegram.WebApp;

  return (
    <BrowserRouter>
      <Header />
      <main>
        <MainRouter>
          <Route path={PATH.Home} element={<MainPage />} />

          <Route path={PATH.Auth} element={<AuthPage />} />
          <Route path={PATH.Login} element={<LoginPage />} />

          <Route path={PATH.Profile} element={<ProfilePage />} />
          {/* <Route path={PATH.Siba} element={<Siba />} /> */}
        </MainRouter>
      </main>
    </BrowserRouter>
  );
};
