import { Controller, type Control } from "react-hook-form";
import { IconRight } from "../../assets/icons/IconRight";
import { Button, Input } from "../../ui";
import { IconButton } from "../../ui/icon-button/icon-button";
import { IconMale } from "../../assets/icons/IconMale";
import { IconFemale } from "../../assets/icons/IconFemale";
import { IconSibka } from "../../assets/icons/IconSibka";
import { IconSibkaWhite } from "../../assets/icons/IconSibkaWhite";
import { IconSibkaBlack } from "../../assets/icons/IconSibkaBlack";
import type { AuthFormType } from "./types";
import type { FC } from "react";

interface FirstStep {
  control: Control<AuthFormType>;
  setActiveStep: (value: number) => void;
}

export const FirstStep: FC<FirstStep> = ({ control, setActiveStep }) => {
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
          name="sibaname"
          render={({ field }) => (
            <Input
              label="Кличка Вашего питомца"
              onChange={(e) => field.onChange(e)}
              value={field.value}
              placeholder="Введите кличку"
              description="Больше питомцев, можно добавить в личном кабинете"
            />
          )}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <div style={{ display: "flex", gap: "20px" }}>
                <IconButton
                  variant={field.value === "male" ? "pressed" : "primary"}
                  onClick={() => field.onChange("male")}
                  size="large"
                  icon={<IconMale />}
                />
                <IconButton
                  variant={field.value === "female" ? "pressed" : "primary"}
                  onClick={() => field.onChange("female")}
                  size="large"
                  icon={<IconFemale />}
                />
              </div>
            )}
          />
          <Controller
            control={control}
            name="icon"
            render={({ field }) => (
              <div style={{ display: "flex", gap: "20px", cursor: "pointer" }}>
                <IconButton
                  size="large"
                  variant={field.value === "default" ? "pressed" : "primary"}
                  onClick={() => field.onChange("default")}
                  icon={<IconSibka />}
                />
                <IconButton
                  size="large"
                  variant={field.value === "white" ? "pressed" : "primary"}
                  onClick={() => field.onChange("white")}
                  icon={<IconSibkaWhite />}
                />
                <IconButton
                  size="large"
                  variant={field.value === "black" ? "pressed" : "primary"}
                  onClick={() => field.onChange("black")}
                  icon={<IconSibkaBlack />}
                />
              </div>
            )}
          />
        </div>
      </div>
      <Button
        iconRight={<IconRight />}
        onClick={() => setActiveStep(2)}
        size="large"
      >
        Продолжить
      </Button>
    </div>
  );
};
