import AppBar from "@mui/material/AppBar";
import { Toolbar } from "@mui/material";
import stls from "./Header.module.sass";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { IconSibkaHeader } from "../../assets/icons/IconSibkaHeader";
import { PATH } from "../../constants/path";
import { useLocation } from "react-router-dom";
import { USER_LOCALSTORAGE } from "../../constants/constants";

const isOpenHeaderPaths: string[] = [PATH.Home, PATH.Profile];

export function Header() {
  const navigate = useNavigate();
  const [isOpenHeader, setIsOpenHeader] = useState(false);
  const { pathname } = useLocation();
  const authUser = localStorage.getItem(USER_LOCALSTORAGE);

  useEffect(() => {
    if (isOpenHeaderPaths.includes(pathname)) {
      setIsOpenHeader(true);
    } else {
      setIsOpenHeader(false);
    }
  }, [pathname]);

  const [scroll, setScroll] = useState(0);

  const handleScroll = () => {
    setScroll(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {isOpenHeader && authUser && (
        <div className={stls.header}>
          <AppBar
            className={scroll ? stls.appbarScroll : stls.appbar}
            component="nav"
          >
            <Toolbar className={stls.toolbar}>
              <div
                onClick={() => navigate(PATH.Home)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <IconSibkaHeader />
                <h1 style={{ fontSize: "24px" }}>SIBINATOR</h1>
              </div>
            </Toolbar>
          </AppBar>
        </div>
      )}
    </>
  );
}
