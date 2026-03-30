import { useState } from "react";
import colors from "../../styles/config/Color.module.sass";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../shared/constants/path";
import stls from "./login.module.sass";
import { Button, Input, LayoutPage } from "../../shared/ui";
import { supabase } from "../../shared/api/supabase-сlient";
import { USER_LOCALSTORAGE } from "../../shared/constants/constants";
import { useLocalStorage } from "../../shared/hooks/use-local-storage";
import {
  IconCrown,
  IconEyeClose,
  IconEyeOpen,
  IconPawButton,
} from "../../shared/icons";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [, setUserLocalStorage] = useLocalStorage(USER_LOCALSTORAGE, {
    e_mail: null,
    phone: null,
  });

  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openTelegramApp = () => {
    const appLink = import.meta.env.VITE_TELEGRAM_APP_LINK as
      | string
      | undefined;
    const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME as
      | string
      | undefined;

    if (appLink) {
      window.location.href = appLink;
      return true;
    }

    if (botUsername) {
      const normalized = botUsername.replace(/^@/, "");
      const tgSchemeUrl = `tg://resolve?domain=${normalized}`;
      const webUrl = `https://t.me/${normalized}`;

      window.location.href = tgSchemeUrl;

      setTimeout(() => {
        window.location.href = webUrl;
      }, 900);

      return true;
    }

    return false;
  };

  const handleTelegramLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const initData = window?.Telegram?.WebApp?.initData;
      if (!initData) {
        const hasRedirect = openTelegramApp();
        if (!hasRedirect) {
          setError(
            "Не удалось открыть Telegram автоматически. Укажите VITE_TELEGRAM_APP_LINK или VITE_TELEGRAM_BOT_USERNAME.",
          );
        }
        return;
      }

      const { data, error: invokeError } = await supabase.functions.invoke(
        "telegram-login",
        {
          body: {
            initData,
            redirectTo: `${window.location.origin}${PATH.Home}`,
          },
        },
      );

      if (invokeError) {
        setError(invokeError.message);
        return;
      }

      const access_token = data?.access_token;
      const refresh_token = data?.refresh_token;

      const action_link = data?.action_link ?? data?.redirect_to;
      if (action_link) {
        window.location.href = action_link;
        return;
      }

      if (!access_token || !refresh_token) {
        setError("Telegram вход не удался: токены не получены.");
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      navigate(PATH.Home);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async () => {
    setError(null);
    setIsLoading(true);
    if (email && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const normalizedError = error.message.toLowerCase();
        if (normalizedError.includes("invalid login credentials")) {
          setError("Пользователь с таким email не найден или пароль неверный.");
        } else if (normalizedError.includes("email not confirmed")) {
          setError(
            "Электронная почта не подтверждена. Проверьте почту и перейдите по ссылке из письма.",
          );
        } else {
          setError(`Ошибка авторизации: ${error.message}`);
        }
      } else {
        setUserLocalStorage({ email: data.user.email, phone: data.user.phone });
        navigate(PATH.Home);
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
                      {showPassword ? <IconEyeOpen /> : <IconEyeClose />}
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
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <Button
                  loading={isLoading}
                  size="large"
                  iconRight={<IconPawButton />}
                  onClick={handleLoginSubmit}
                >
                  Войти
                </Button>
                <Button
                  loading={isLoading}
                  size="large"
                  variant="secondary"
                  onClick={handleTelegramLogin}
                >
                  Войти через Telegram
                </Button>
              </div>
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
