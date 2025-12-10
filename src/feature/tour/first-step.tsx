import { IconRight } from "../../shared/icons/IconRight";
import type { FC } from "react";
import { Button, IconButton } from "../../shared/ui";
import stls from "./tour.module.sass";

interface FirstStep {
  setActiveStep: (value: number) => void;
}
export const FirstStep: FC<FirstStep> = ({ setActiveStep }) => {
  return (
    <div className={stls.tourContainer}>
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className={stls.iconSiba}>
            <img style={{ width: 44, height: 44 }} src="sibka.png" />
          </div>
          <IconButton
            onClick={() => setActiveStep(2)}
            size="large"
            variant="secondary"
            icon={<IconRight />}
          />
        </div>
        <span style={{ fontSize: "25px" }}>
          Найди друзей <br />
          для <b>своего сиба-ину</b>
        </span>
        <span style={{ color: "#65635E", fontSize: "14px" }}>
          Добавь своего сиба-ину на карту, найди других для общения и совместных
          прогулок
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img src="/onboarding.png" style={{ width: "100%" }} />
        <Button
          style={{
            position: "absolute",
            bottom: "42px",
            width: "calc(100% - 60px)",
          }}
          onClick={() => setActiveStep(2)}
          size="large"
        >
          Далее
        </Button>
      </div>
    </div>
  );
};
