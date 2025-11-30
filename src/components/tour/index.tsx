import { useState } from "react";
import { FirstStep } from "./first-step";
import { FourthStep } from "./fourth-step";
import { ThirdStep } from "./third-step";
import { SecondStep } from "./second-step";
import { Button } from "../../ui";
import { IconRight } from "../../assets/icons/IconRight";

export const Tour = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {activeStep === 0 && (
        <div
          style={{
            backgroundImage: "url(background-tour.png)",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              alignItems: "center",
              marginTop: "80px",
            }}
          >
            <div
              style={{
                width: 84,
                height: 84,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#FFFCF5",
                borderRadius: "50%",
              }}
            >
              <img style={{ width: 60, height: 60 }} src="sibka.png" />
            </div>
            <h1 style={{ color: "#FFFCF5" }}>Sibinator</h1>
          </div>
          <div style={{ marginBottom: "52px" }}>
            <Button
              onClick={() => setActiveStep(1)}
              iconRight={<IconRight />}
              size="large"
            >
              Вперед
            </Button>
          </div>
        </div>
      )}
      {activeStep === 1 && <FirstStep setActiveStep={setActiveStep} />}
      {activeStep === 2 && <SecondStep setActiveStep={setActiveStep} />}
      {activeStep === 3 && <ThirdStep setActiveStep={setActiveStep} />}
      {activeStep === 4 && <FourthStep />}
    </div>
  );
};
