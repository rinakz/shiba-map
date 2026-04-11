import { useForm } from "react-hook-form";
import { Box, Step, Stepper } from "@mui/material";
import { useState } from "react";
import stls from "./auth.module.sass";
import { IconCrown } from "../../shared/icons/IconCrown";
import { useLocation, useNavigate } from "react-router-dom";
import colors from "../../styles/config/Color.module.sass";
import { PATH } from "../../shared/constants/path";
import type { AccountType, AuthFormType } from "./types";
import { LayoutPage } from "../../shared/ui";
import {
  BreederCredentialsStep,
  FirstStep,
  FourthStep,
  SecondStep,
  ThirdStep,
} from "../../feature/auth";

export const AuthPage = () => {
  const location = useLocation();
  const methodParam = new URLSearchParams(location.search).get("method");
  const authMethod = methodParam === "telegram" ? "telegram" : "email";

  const { control, watch, setValue } = useForm<AuthFormType>({
    mode: "onSubmit",
    defaultValues: {
      nickname: "",
      password: "",
      inviteCode: "",
      tgname: "",
      isShowTgName: false,
      sibaname: "",
      icon: "default",
      location: "",
      gender: "male",
      email: "",
      kennelCity: "",
      kennelPrefix: "",
    },
  });

  const [activeStep, setActiveStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>("owner");
  const [kennelLogoFile, setKennelLogoFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const formData = watch();
  const totalSteps = accountType === "breeder" ? 3 : 4;
  const stepLabels = Array.from({ length: totalSteps }, (_, i) => i + 1);

  const handleAccountTypeChange = (next: AccountType) => {
    if (next === accountType) return;
    setAccountType(next);
    setKennelLogoFile(null);
    if (next === "owner") {
      setValue("kennelCity", "");
      setValue("kennelPrefix", "");
    } else {
      setValue("sibaname", "");
      setValue("gender", "male");
      setValue("icon", "default");
    }
  };

  const showPrivacyFooter =
    (accountType === "owner" && activeStep === 3) ||
    (accountType === "breeder" && activeStep === 2);

  return (
    <LayoutPage>
      <div className={stls.pageContainer}>
        <div className={stls.loginContainer}>
          <div style={{ width: "84px", height: "84px", display: "flex" }}>
            <img style={{ width: "inherit" }} src="logo.png" alt="" />
          </div>
          <div className={stls.formContainer}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <IconCrown />
                <h1 className={stls.authTitle}>Регистрация</h1>
              </div>
              <Box className={stls.stepperContainer}>
                <Stepper>
                  {stepLabels.map((label) => (
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
                  accountType={accountType}
                  onAccountTypeChange={handleAccountTypeChange}
                  kennelLogoFile={kennelLogoFile}
                  onKennelLogoChange={setKennelLogoFile}
                />
              )}
              {activeStep === 2 && accountType === "owner" && (
                <SecondStep
                  control={control}
                  setActiveStep={setActiveStep}
                  formData={formData}
                  authMethod={authMethod}
                />
              )}
              {activeStep === 2 && accountType === "breeder" && (
                <BreederCredentialsStep
                  control={control}
                  setActiveStep={setActiveStep}
                  formData={formData}
                  authMethod={authMethod}
                />
              )}
              {activeStep === 3 && accountType === "owner" && (
                <ThirdStep
                  control={control}
                  setActiveStep={setActiveStep}
                  formData={formData}
                />
              )}
              {((activeStep === 3 && accountType === "breeder") ||
                (activeStep === 4 && accountType === "owner")) && (
                <FourthStep
                  setActiveStep={setActiveStep}
                  formData={formData}
                  authMethod={authMethod}
                  accountType={accountType}
                  kennelLogoFile={kennelLogoFile}
                />
              )}
            </form>
          </div>{" "}
          {showPrivacyFooter ? (
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
