import AppBar from "@mui/material/AppBar";
import { Toolbar } from "@mui/material";
import stls from "./Header.module.sass";
import { useNavigate } from "react-router";
import { useContext, useEffect, useMemo, useState } from "react";
import { IconSibkaHeader } from "../../shared/icons/IconSibkaHeader";
import { useLocation } from "react-router-dom";
import { AppContext } from "../context/app-context";
import { isNotOpenHeaderPaths } from "../constants";
import { PATH } from "../constants/path";
import { IconButton } from "../ui";
import { IconGraduationCap } from "../icons";

export function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { authUserId } = useContext(AppContext);

  const [scroll, setScroll] = useState(0);

  const isOpenHeader = useMemo(
    () => !isNotOpenHeaderPaths.includes(pathname),
    [pathname],
  );

  const handleScroll = () => {
    setScroll(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    isOpenHeader &&
    authUserId && (
      <div className={stls.header}>
        <AppBar
          className={scroll ? stls.appbarScroll : stls.appbar}
          component="nav"
          sx={{
            height: { xs: 116, md: 72 },
            minHeight: { xs: 116, md: 72 },
            backgroundColor: scroll ? "rgba(238, 234, 222, 0.7)" : "transparent",
          }}
        >
          <Toolbar
            className={stls.toolbar}
            sx={{
              minHeight: { xs: 104, sm: 64, md: 72 },
              px: { xs: 2.5, sm: 2.5, md: 4 },
            }}
          >
            <div onClick={() => navigate(PATH.Home)} className={stls.logoBlock}>
              <IconSibkaHeader />
              <h1 className={stls.title}>SIBINATOR</h1>
            </div>
            <div className={stls.actions}>
              <IconButton
                className={stls.knowledgeCta}
                size="large"
                variant="primary"
                title="База знаний"
                icon={<IconGraduationCap size={24} />}
                onClick={() => navigate(PATH.Knowledge)}
              />
            </div>
          </Toolbar>
        </AppBar>
      </div>
    )
  );
}
