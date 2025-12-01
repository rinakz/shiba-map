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
import { supabase } from "../../api/supabase-сlient";
import { USER_LOCALSTORAGE } from "../../constants/constants";
import { useLocalStorage } from "../../hooks/use-local-storage";

export const Login = () => {
  const navigate = useNavigate();
  const [userLocaleStorage, setUserLocalStorage] = useLocalStorage(
    USER_LOCALSTORAGE,
    {
      e_mail: null,
      phone: null,
    }
  );

  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async () => {
    setError(null);
    setIsLoading(true);
    if (email && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log(error);
        setError("Ошибка авторизации: " + error);
      } else {
        setUserLocalStorage({ email: data.user.email, phone: data.user.phone });
        if (userLocaleStorage) {
          navigate(PATH.Home);
        }
      }
    } else {
      setError("Заполните все поля");
    }
    setIsLoading(false);
  };

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
                <Input
                  label="Email"
                  placeholder="Введите Ваш e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type={showPassword ? "text" : "password"}
                  label="Пароль"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {error && (
                <span style={{ fontSize: "12px", color: "#E95B47" }}>
                  {error}
                </span>
              )}{" "}
              <Button
                loading={isLoading}
                size="large"
                iconRight={<IconPawButton />}
                onClick={handleLoginSubmit}
              >
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
