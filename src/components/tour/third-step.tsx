import type { FC } from "react";
import { IconRight } from "../../assets/icons/IconRight";
import stls from "./tour.module.sass";
import { Button, IconButton } from "../../ui";

interface ThirdStep {
  setActiveStep: (value: number) => void;
}
export const ThirdStep: FC<ThirdStep> = ({ setActiveStep }) => {
  return (
    <div className={stls.tourContainer}>
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className={stls.iconSiba}>
            <img style={{ width: 44, height: 44 }} src="sibka.png" />
          </div>
          <IconButton
            onClick={() => setActiveStep(4)}
            size="large"
            variant="secondary"
            icon={<IconRight />}
          />
        </div>
        <span style={{ fontSize: "25px" }}>
          Делитесь веселыми
          <br />
          <b>моментами в сторис</b>
        </span>
        <span style={{ color: "#65635E", fontSize: "14px" }}>
          Галерея вашего телефона переполнена фото любимого питомца, делись ими!
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img src="/onboarding-2.png" style={{ width: "100%" }} />
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
            onClick={() => setActiveStep(2)}
            size="large"
            variant="secondary"
            icon={<IconRight />}
          />
          <Button
            style={{ flex: 1 }}
            onClick={() => setActiveStep(4)}
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
