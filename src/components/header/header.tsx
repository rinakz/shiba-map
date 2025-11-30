import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import { Toolbar } from "@mui/material";
import stls from "./Header.module.sass";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { IconSibkaHeader } from "../../assets/icons/IconSibkaHeader";
import { IconPlacemark } from "../../assets/icons/IconPlacemark";
import { PATH } from "../../constants/path";
import { useLocation } from "react-router-dom";

const isOpenHeaderPaths: string[] = [PATH.Home];

export function Header() {
  const navigate = useNavigate();
  const [isOpenHeader, setIsOpenHeader] = useState(false);
  const { pathname } = useLocation();
  const isAuthUser = undefined;

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
      {isOpenHeader && isAuthUser && (
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
                <h1 style={{ fontSize: "46px" }}>SIBINATOR</h1>
              </div>

              <Box sx={{ display: { sm: "block" } }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div
                    className={stls.buttonPhone}
                    onClick={() => navigate(PATH.Login)}
                  >
                    <IconPlacemark />
                  </div>
                  {/* <div className={stls.buttonPhone}>
                <a color="inherit" href="tel:+79660060596">
                  <IconPhoneButton />
                </a>
              </div> */}
                </div>
              </Box>
            </Toolbar>
          </AppBar>
        </div>
      )}
    </>
  );
}
