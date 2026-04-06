import { useState, type FC } from "react";
import { Controller, type Control } from "react-hook-form";
import { IconRight } from "../../shared/icons/IconRight";
import stls from "./auth.module.sass";
import { Button, IconButton, Input } from "../../shared/ui";
import { IconEyeClose } from "../../shared/icons/IconEyeClose";
import { IconEyeOpen } from "../../shared/icons/IconEyeOpen";
import type { AuthFormType } from "../../pages/auth-page/types";

interface SecondStep {
  control: Control<AuthFormType>;
  setActiveStep: (value: number) => void;
  formData: AuthFormType;
  authMethod: "email" | "telegram";
}

export const SecondStep: FC<SecondStep> = ({
  control,
  setActiveStep,
  formData,
  authMethod,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNextStep = () => {
    setError(null);
    if (
      (authMethod === "telegram" && formData.nickname) ||
      (authMethod === "email" && formData.nickname && formData.email && formData.password)
    ) {
      setActiveStep(3);
    } else {
      setError("Заполните все поля");
    }
  };

  return (
    <div className={stls.stepContainer}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <Controller
          control={control}
          name="nickname"
          render={({ field }) => (
            <Input
              label="Ваш никнейм"
              onChange={(e) => field.onChange(e)}
              value={field.value}
              placeholder="Введите ваш никнейм"
            />
          )}
        />
        {authMethod === "email" && (
          <>
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input
              label="Ваш e-mail"
              onChange={(e) => field.onChange(e)}
              value={field.value}
              placeholder="Введите ваш e-mail"
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <Input
              type={showPassword ? "text" : "password"}
              label="Пароль"
              placeholder="Введите пароль"
              value={field.value}
              onChange={(e) => field.onChange(e)}
              icon={
                <div
                  className={stls.eyeIcon}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <IconEyeOpen /> : <IconEyeClose />}
                </div>
              }
                />
              )}
            />
          </>
        )}
        <Controller
          control={control}
          name="inviteCode"
          render={({ field }) => (
            <Input
              label="У меня есть код"
              onChange={(e) => field.onChange(e)}
              value={field.value}
              placeholder="Введите промокод друга (необязательно)"
            />
          )}
        />
      </div>
      {error && (
        <span style={{ fontSize: "12px", color: "#E95B47" }}>{error}</span>
      )}
      <div style={{ display: "flex", gap: "16px" }}>
        <IconButton
          onClick={() => setActiveStep(1)}
          variant="secondary"
          size="large"
          icon={
            <span style={{ display: "flex", transform: "rotate(-180deg)" }}>
              <IconRight />
            </span>
          }
        />
        <Button
          style={{ width: "100%" }}
          iconRight={<IconRight />}
          onClick={handleNextStep}
          size="large"
        >
          Продолжить
        </Button>
      </div>
    </div>
  );
};
