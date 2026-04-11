import { Checkbox } from "@mui/material";
import { useState, type FC } from "react";
import { Controller, type Control } from "react-hook-form";
import { IconRight } from "../../shared/icons/IconRight";
import { Button, IconButton, Input } from "../../shared/ui";
import type { AuthFormType } from "../../pages/auth-page/types";
import stls from "./auth.module.sass";
import { IconEyeClose } from "../../shared/icons/IconEyeClose";
import { IconEyeOpen } from "../../shared/icons/IconEyeOpen";

const checkboxLabel = { inputProps: { "aria-label": "Показывать имя в Telegram" } };

interface BreederCredentialsStepProps {
  control: Control<AuthFormType>;
  setActiveStep: (value: number) => void;
  formData: AuthFormType;
  authMethod: "email" | "telegram";
}

export const BreederCredentialsStep: FC<BreederCredentialsStepProps> = ({
  control,
  setActiveStep,
  formData,
  authMethod,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNextStep = () => {
    setError(null);
    const baseOk =
      formData.nickname &&
      formData.tgname &&
      (authMethod === "telegram" ||
        (formData.email && formData.password));
    if (baseOk) {
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
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Controller
            control={control}
            name="tgname"
            render={({ field }) => (
              <Input
                label="Имя пользователя в телеграм"
                onChange={(e) => field.onChange(e)}
                value={field.value}
                placeholder="Введите ваш никнейм в телеграм"
              />
            )}
          />
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Controller
              control={control}
              name="isShowTgName"
              render={({ field }) => (
                <Checkbox
                  {...checkboxLabel}
                  checked={Boolean(field.value)}
                  onChange={(e) => field.onChange(e.target.checked)}
                  color="default"
                />
              )}
            />
            <span style={{ fontSize: "14px" }}>Показывать имя</span>
          </div>
        </div>
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
