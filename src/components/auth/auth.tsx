import { useForm } from "react-hook-form";
import { LayoutPage } from "../general/layout-page";
import { FirstStep } from "./first-step";
import { SecondStep } from "./second-step";
import { ThirdStep } from "./third-step";
import { Box, Step, Stepper } from "@mui/material";
import { useState } from "react";
import stls from "./auth.module.sass";
// import useWindowSize from "../../hooks/use-window-size";
import { IconCrown } from "../../assets/icons/IconCrown";
import { useNavigate } from "react-router-dom";
import colors from "../../styles/config/Color.module.sass";
import { PATH } from "../../constants/path";
import type { AuthFormType } from "./types";
import { FourthStep } from "./fourth-step";

export const Auth = () => {
  const { control, watch } = useForm<AuthFormType>({
    mode: "onSubmit",
    defaultValues: {
      nickname: "",
      password: "",
      tgname: "",
      isShowTgName: false,
      chat: "",
      sibaname: "",
      icon: "default",
      location: "",
      gender: "male",
      email: "",
    },
  });

  const [activeStep, setActiveStep] = useState(1);
  // const { width } = useWindowSize();
  const navigate = useNavigate();

  const formData = watch();

  // const [tablet, setTablet] = useState(false);

  // useEffect(() => {
  //   setTablet(width < 1000);
  // }, [width]);

  return (
    <LayoutPage>
      <div className={stls.pageContainer}>
        <div className={stls.loginContainer}>
          <div style={{ width: "84px", height: "84px", display: "flex" }}>
            <img style={{ width: "inherit" }} src="logo.png" />
          </div>
          <div className={stls.formContainer}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <IconCrown />
                <h1 style={{ fontSize: "40px" }}>Регистрация</h1>
              </div>
              <Box className={stls.stepperContainer}>
                <Stepper>
                  {[1, 2, 3, 4].map((label) => (
                    <Step
                      className={stls.step}
                      style={{
                        background:
                          label <= activeStep ? "#FFFCF5" : "transparent",
                      }}
                      key={label}
                    >
                      <h1 style={{ fontSize: "20px", color: "#FEAE11" }}>
                        {label}
                      </h1>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            </div>
            <form className={stls.form}>
              {activeStep === 1 && (
                <FirstStep
                  control={control}
                  setActiveStep={setActiveStep}
                  formData={formData}
                />
              )}
              {activeStep === 2 && (
                <SecondStep
                  control={control}
                  setActiveStep={setActiveStep}
                  formData={formData}
                />
              )}
              {activeStep === 3 && (
                <ThirdStep
                  control={control}
                  setActiveStep={setActiveStep}
                  formData={formData}
                />
              )}
              {activeStep === 4 && (
                <FourthStep setActiveStep={setActiveStep} formData={formData} />
              )}
            </form>
          </div>{" "}
          {activeStep === 3 ? (
            <div>
              Нажимая кнопку, вы соглашаетесь с{" "}
              <span style={{ color: colors.yellow, cursor: "pointer" }}>
                Политикой конфиденциальности
              </span>
            </div>
          ) : (
            <div>
              Есть аккаунт?{" "}
              <span
                style={{ color: colors.yellow, cursor: "pointer" }}
                onClick={() => navigate(PATH.Login)}
              >
                Войти
              </span>
            </div>
          )}
        </div>
      </div>
    </LayoutPage>
  );
};
