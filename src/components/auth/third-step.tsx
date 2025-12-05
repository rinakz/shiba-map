import { Checkbox } from "@mui/material";
import { Controller, type Control } from "react-hook-form";
import { IconRight } from "../../assets/icons/IconRight";
import { Button, IconButton, Input } from "../../ui";
import type { AuthFormType } from "./types";
import { useState, type FC } from "react";
import stls from "./auth.module.sass";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

interface ThirdStep {
  control: Control<AuthFormType>;
  setActiveStep: (value: number) => void;
  formData: AuthFormType;
}

export const ThirdStep: FC<ThirdStep> = ({
  control,
  setActiveStep,
  formData,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleNextStep = () => {
    setError(null);
    if (formData.tgname && formData.chat) {
      setActiveStep(4);
    } else {
      setError("Заполните все поля");
    }
  };

  return (
    <div className={stls.stepContainer}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
                  {...label}
                  value={field.value}
                  checked={field.value}
                  onChange={(e) => field.onChange(e)}
                  color="default"
                />
              )}
            />
            <span style={{ fontSize: "14px" }}>Показывать имя</span>
          </div>
        </div>
        <Controller
          control={control}
          name="chat"
          render={({ field }) => (
            <Input
              label="Чат в телеграм"
              onChange={(e) => field.onChange(e)}
              value={field.value}
              placeholder="Укажите чат в телеграм"
              description="Укажите чат, в котором Вас смогут найти другие пользователи, если не хотите, чтобы с Вами связывались через личные сообщения"
            />
          )}
        />
      </div>
      {error && (
        <span style={{ fontSize: "12px", color: "#E95B47" }}>{error}</span>
      )}
      <div style={{ display: "flex", gap: "16px" }}>
        <IconButton
          onClick={() => setActiveStep(2)}
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
