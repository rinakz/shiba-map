import { Button } from "@mui/material";
import stls from "~styles/components/Main.module.sass";
import { useNavigate } from "react-router";
import Friends from "./friends";
import Coffee from "./cofee";
import Community from "./community";
import { Stories } from "./stories";
import { IconPawButton } from "~assets/icons/IconPawButton";
import { PATH } from "~routes/path";

function Main() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "60px",
        height: "100%",
      }}
    >
      <div className={stls.mainContainer}>
        <Stories />
        <Button onClick={() => navigate(PATH.Auth)} className={stls.button}>
          ПРИСОЕДИНИТЬСЯ <IconPawButton />
        </Button>
      </div>
      <Friends />
      <Coffee />
      <Community />
    </div>
  );
}

export default Main;
