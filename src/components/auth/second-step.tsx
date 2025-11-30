import { useState, type FC } from "react";
import { Controller, type Control } from "react-hook-form";
import { IconRight } from "../../assets/icons/IconRight";
import stls from "./auth.module.sass";
import { Button, Input } from "../../ui";
import { IconEyeClose } from "../../assets/icons/IconEyeClose";
import { IconEyeOpen } from "../../assets/icons/IconEyeOpen";
import { IconButton } from "../../ui/icon-button/icon-button";
import type { AuthFormType } from "./types";

interface SecondStep {
  control: Control<AuthFormType>;
  setActiveStep: (value: number) => void;
}

export const SecondStep: FC<SecondStep> = ({ control, setActiveStep }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        gap: "40px",
      }}
    >
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
              label="Пароль"
              placeholder="Введите пароль"
              value={field.value}
              onChange={(e) => field.onChange(e)}
              icon={
                <div
                  className={stls.eyeIcon}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <IconEyeClose /> : <IconEyeOpen />}
                </div>
              }
            />
          )}
        />
      </div>
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
          onClick={() => setActiveStep(3)}
          size="large"
        >
          Продолжить
        </Button>
      </div>
    </div>
  );
};
