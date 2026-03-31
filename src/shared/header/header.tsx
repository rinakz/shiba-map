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
import { Button } from "../ui";
import { NewsPanel } from "./news-panel/news-panel";
import { IconCalendar } from "../icons";
import { IconButton } from "../ui";
import { EventCalendar } from "./event-calendar";

export function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { authUserId } = useContext(AppContext);

  const [scroll, setScroll] = useState(0);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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
                size="small"
                icon={<IconCalendar />}
                onClick={() => setIsCalendarOpen(true)}
              />
              <Button size="small" onClick={() => setIsNewsOpen(true)}>
                News
              </Button>
            </div>
          </Toolbar>
          {authUserId && (
            <NewsPanel
              authUserId={authUserId}
              open={isNewsOpen}
              onClose={() => setIsNewsOpen(false)}
            />
          )}
          {authUserId && (
            <EventCalendar
              authUserId={authUserId}
              open={isCalendarOpen}
              onClose={() => setIsCalendarOpen(false)}
            />
          )}
        </AppBar>
      </div>
    )
  );
}
