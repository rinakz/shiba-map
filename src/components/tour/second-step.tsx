import stls from "./tour.module.sass";
import { IconRight } from "../../assets/icons/IconRight";
import { Button, IconButton } from "../../ui";
import type { FC } from "react";

interface SecondStep {
  setActiveStep: (value: number) => void;
}

export const SecondStep: FC<SecondStep> = ({ setActiveStep }) => {
  return (
    <div className={stls.tourContainer}>
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className={stls.iconSiba}>
            <img style={{ width: 44, height: 44 }} src="sibka.png" />
          </div>
          <IconButton
            onClick={() => setActiveStep(3)}
            size="large"
            variant="secondary"
            icon={<IconRight />}
          />
        </div>
        <span style={{ fontSize: "25px" }}>
          Узнавай о новых <br />
          <b>dog-friendly местах</b>
        </span>
        <span style={{ color: "#65635E", fontSize: "14px" }}>
          Отмечайте на карте dog-friendly кафе и площадки, узнавай, где сейчас тусуются все сибы
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img src="/onboarding-1.png" style={{ width: "100%" }} />
        <div
          style={{
            position: "absolute",
            bottom: "42px",
            display: "flex",
            gap: "16px",
            width: "calc(100% - 60px)",
          }}
        >
          <IconButton
            style={{ transform: "rotate(180deg)" }}
            onClick={() => setActiveStep(1)}
            size="large"
            variant="secondary"
            icon={<IconRight />}
          />
          <Button
            style={{ flex: 1 }}
            onClick={() => setActiveStep(3)}
            iconRight={<IconRight />}
            size="large"
          >
            Вперед
          </Button>
        </div>
      </div>
    </div>
  );
};
