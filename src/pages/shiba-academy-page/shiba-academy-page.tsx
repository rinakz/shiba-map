import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../shared/context/app-context";
import { PATH } from "../../shared/constants/path";
import { IconButton, LayoutPage, MainTabBar } from "../../shared/ui";
import { IconRight } from "../../shared/icons";
import { ShibaAcademy } from "../profile-page/shiba-academy";
import stls from "./shiba-academy-page.module.sass";

export const ShibaAcademyPage = () => {
  const navigate = useNavigate();
  const { mySiba } = useContext(AppContext);

  return (
    <LayoutPage>
      <div className={stls.page}>
        <div className={stls.headerRow}>
          <IconButton
            size="medium"
            variant="secondary"
            icon={
              <span style={{ display: "flex", transform: "rotate(-180deg)" }}>
                <IconRight />
              </span>
            }
            onClick={() => navigate(PATH.Profile)}
          />
          <h1 className={stls.title}>Академия Сиб</h1>
        </div>

        <ShibaAcademy sibaId={mySiba?.id} />
      </div>
      <MainTabBar active="profile" />
    </LayoutPage>
  );
};

