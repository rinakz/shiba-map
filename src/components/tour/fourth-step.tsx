import stls from "./tour.module.sass";
import { Button } from "../../ui";
import { IconPawButton } from "../../assets/icons/IconPawButton";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../constants/path";

export const FourthStep = () => {
  const navigate = useNavigate();

  return (
    <div className={stls.tourContainer}>
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className={stls.iconSiba}>
            <img style={{ width: 44, height: 44 }} src="sibka.png" />
          </div>
        </div>
        <span style={{ fontSize: "25px" }}>
          Присоединяйся к нашему
          <br />
          <b>дружному сообществу</b>
        </span>
        <span style={{ color: "#65635E", fontSize: "14px" }}>
          Здесь ты найдешь единомышленников и любителей сиба-ину{" "}
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img src="/onboarding-3.png" style={{ width: "100%" }} />
        <div
          style={{
            position: "absolute",
            bottom: "42px",
            display: "flex",
            gap: "16px",
            width: "calc(100% - 60px)",
          }}
        >
          <Button
            style={{ flex: 1 }}
            onClick={() => navigate(PATH.Auth)}
            iconRight={<IconPawButton />}
            size="large"
          >
            Присоединяйся
          </Button>
        </div>
      </div>
    </div>
  );
};
