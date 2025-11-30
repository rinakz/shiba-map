import { useForm } from "react-hook-form";
import { LayoutPage } from "../general/layout-page";
import { useState } from "react";
import { IconPawButton } from "../../assets/icons/IconPawButton";
import colors from "../../styles/config/Color.module.sass";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../constants/path";
import { IconEyeClose } from "../../assets/icons/IconEyeClose";
import { IconEyeOpen } from "../../assets/icons/IconEyeOpen";
import { IconCrown } from "../../assets/icons/IconCrown";
import stls from "./login.module.sass";
import { Button, Input } from "../../ui";
import type { LoginFormType } from "./types";

export const Login = () => {
  const {
    setValue,
    control,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    clearErrors,
  } = useForm<LoginFormType>({
    mode: "onSubmit",
    defaultValues: {
      password: "",
      email: "",
    },
  });

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <LayoutPage>
      <div className={stls.pageContainer}>
        <div className={stls.loginContainer}>
          <div style={{ width: "84px", height: "84px", display: "flex" }}>
            <img style={{ width: "inherit" }} src="logo.png" />
          </div>
          <div className={stls.formContainer}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <IconCrown />
              <h1 style={{ fontSize: "40px" }}>Войти</h1>
            </div>

            <form className={stls.form}>
              <div className={stls.fieldsContainer}>
                <Input label="Email" placeholder="Введите Ваш e-mail" />
                <Input
                  label="Пароль"
                  placeholder="Введите пароль"
                  icon={
                    <div
                      className={stls.eyeIcon}
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <IconEyeClose /> : <IconEyeOpen />}
                    </div>
                  }
                  description="Забыли пароль?"
                />
              </div>
              <Button size="large" iconRight={<IconPawButton />}>
                Войти
              </Button>
            </form>
          </div>
        </div>
        <div>
          Нет аккаунта?{" "}
          <span
            style={{ color: colors.yellow, cursor: "pointer" }}
            onClick={() => navigate(PATH.Auth)}
          >
            Регистрация
          </span>
        </div>
      </div>
    </LayoutPage>
  );
};
