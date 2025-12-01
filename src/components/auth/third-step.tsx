import { Checkbox } from "@mui/material";
import { Controller, type Control } from "react-hook-form";
import { IconRight } from "../../assets/icons/IconRight";
import { Button, IconButton, Input } from "../../ui";
import { IconPawButton } from "../../assets/icons/IconPawButton";
import { useNavigate } from "react-router-dom";
import type { AuthFormType } from "./types";
import { useState, type FC } from "react";
import { supabase } from "../../api/supabase-сlient";
import stls from "./auth.module.sass";
import { PATH } from "../../constants/path";

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
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setError(null);
    setIsLoading(true);
    if (formData.tgname && formData.chat) {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message);
      } else {
        const { error: insertError } = await supabase.from("users").insert([
          {
            user_id: data.user?.id && data.user.id,
            email: formData.email,
            nickname: formData.nickname,
            tgname: formData.tgname,
            is_show_tgname: formData.isShowTgName,
            telegram_chat: formData.chat,
          },
        ]);

        if (insertError) {
          setError(insertError.message);
        } else {
          const { error: insertSibaError } = await supabase
            .from("sibains")
            .insert([
              {
                siba_user_id: data.user?.id && data.user.id,
                siba_name: formData.sibaname,
                siba_icon: formData.icon,
                siba_gender: formData.gender,
              },
            ]);

          if (insertSibaError) {
            setError(insertSibaError.message);
          } else {
            navigate(PATH.Login);
          }
        }
      }
    } else {
      setError("Заполните все поля");
    }
    setIsLoading(false);
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
          iconRight={<IconPawButton />}
          size="large"
          onClick={handleRegister}
          loading={isLoading}
        >
          Зарегистрироваться
        </Button>
      </div>
    </div>
  );
};
