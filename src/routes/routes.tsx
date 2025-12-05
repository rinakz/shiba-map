import { Routes as MainRouter, Route, BrowserRouter } from "react-router-dom";
import { Auth } from "../components/auth/auth";
import { Header } from "../components/header/header";
import { Profile } from "../components/profile/profile";
import { PATH } from "../constants/path";
import { Login } from "../components/login/login";
import type { FC } from "react";
import { Main } from "../components";
import { Siba } from "../components/siba/siba";
export const Routes: FC = () => {
  // const initData = window.Telegram.WebApp;

  return (
    <BrowserRouter>
      <Header />
      <main>
        <MainRouter>
          <Route path={PATH.Home} element={<Main />} />

          <Route path={PATH.Auth} element={<Auth />} />
          <Route path={PATH.Login} element={<Login />} />

          <Route path={PATH.Profile} element={<Profile />} />
          <Route path={PATH.Siba} element={<Siba />} />
        </MainRouter>
      </main>
    </BrowserRouter>
  );
};
