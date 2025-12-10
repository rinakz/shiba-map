import { useContext, useEffect, useState, type ChangeEvent } from "react";
import { AppContext } from "../../shared/context/app-context";
import { IconPeople } from "../../shared/icons/IconPeople";
import { IconChat } from "../../shared/icons/IconChat";
import { IconTg } from "../../shared/icons/IconTg";
import { ProgressBar } from "../../shared/ui/progress-bar";
import stls from "./profile.module.sass";
import { IconCafe } from "../../shared/icons/IconCafe";
import { IconPark } from "../../shared/icons/IconPark";
import { IconGroomer } from "../../shared/icons/IconGroomer";
import { Button, LayoutPage } from "../../shared/ui";
import { IconRight } from "../../shared/icons/IconRight";
import { IconAvatar } from "../../shared/icons/IconAvatar";
import { supabase } from "../../shared/api/supabase-сlient";
import { USER_LOCALSTORAGE } from "../../shared/constants/constants";

export const ProfilePage = () => {
  const authUser = localStorage.getItem(USER_LOCALSTORAGE);

  const { user, mySiba, setUser, setSibaIns, setMySiba } =
    useContext(AppContext);

  const [avatar, setAvatar] = useState<string | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserByEmail = async () => {
    if (authUser) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", JSON.parse(authUser).email);

      if (error) {
        console.error("Ошибка при получении пользователя:", error);
        return null;
      }

      setUser(data[0]);
    }
  };

  const getSibaIns = async () => {
    if (authUser) {
      const { data, error } = await supabase.from("sibains").select("*");

      if (error) {
        console.error("Ошибка при получении сиб:", error);
        return null;
      }

      setSibaIns(data);
    }
  };

  const getMySiba = async () => {
    if (authUser && user?.user_id) {
      const { data, error } = await supabase
        .from("sibains")
        .select("*")
        .eq("siba_user_id", user.user_id);

      if (error) {
        console.error("Ошибка при получении сибы:", error);
        return null;
      }

      setMySiba(data[0]);
    }
  };

  // при входе в свой профиль получаем юзера и весь список сибиков
  useEffect(() => {
    if (authUser) {
      getUserByEmail();
      getSibaIns();
    }
  }, [authUser]);

  // при получении текущего юзера делаем запрос на его сибу
  useEffect(() => {
    if (authUser && user?.user_id) {
      getMySiba();
    }
  }, [authUser, user]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (error) {
      setError(null);
    }
    if (event.target.files) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async () => {
    if (!avatar) {
      setError("Пожалуйста, выберите файл для загрузки.");
      return;
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("sibinator")
      .upload(`images/${mySiba.id}_${Date.now()}.png`, avatar); // Используйте уникальное имя файла

    if (uploadError) {
      setError(uploadError.message);
      return;
    }
    const { data } = supabase.storage
      .from("sibinator")
      .getPublicUrl(uploadData.path);

    if (!data) {
      setError("Ошибка");
      return;
    }

    const { error: insertSibaError } = await supabase
      .from("sibains")
      .update({ photos: data.publicUrl })
      .eq("id", mySiba.id);

    if (insertSibaError) {
      setError(insertSibaError.message);
    } else {
      setIsEdit(false);
      setAvatar(null); // Сбрасываем аватар после успешной загрузки
    }
  };

  return (
    <LayoutPage>
      <div className={stls.profileContainer}>
        <div className={stls.sibaInfoContainer}>
          {isEdit ? (
            <div style={{ position: "relative" }}>
              {avatar ? (
                <img className={stls.uploadedPhoto} src={avatar} alt="Avatar" />
              ) : mySiba.photo ? (
                <img
                  style={{ width: "200px", height: "200px" }}
                  src={`/${mySiba?.siba_icon}.png`}
                />
              ) : (
                <div className={stls.customInputPhoto}>
                  <IconAvatar />
                </div>
              )}
              <input
                className={stls.inputPhoto}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <img
              style={{ width: "200px", height: "200px" }}
              src={`/${mySiba?.siba_icon}.png`}
            />
          )}
          <h1 style={{ fontSize: 64 }}>{mySiba?.siba_name}</h1>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <span style={{ color: "#74736E" }}>
              {mySiba?.siba_gender === "male" ? "Мальчик" : "Девочка"}
            </span>
            <span style={{ color: "#74736E" }}>
              level: {mySiba?.level ?? 0}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <span>Подписки: {mySiba?.followers ?? 0}</span>{" "}
            <span>Подписчики: {mySiba?.followings ?? 0}</span>
          </div>
        </div>
        <div className={stls.ownerCard}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconPeople /> {user?.nickname}
          </div>
          <div className={stls.ownerInfo}>
            <IconChat />
            {user?.is_show_tgname ? user?.telegram_chat : "Информация скрыта"}
          </div>
          <div className={stls.ownerInfo}>
            <IconTg />
            {user?.is_show_tgname ? user?.tgname : "Информация скрыта"}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "12px",
          }}
        >
          Достижения
          <div className={stls.progressContainer}>
            <div className={stls.progressTitle}>
              <IconCafe />
              <p>Кафе</p>
            </div>
            <ProgressBar value={mySiba?.cafe ?? 0} color="#7A7B7B" />
            <span>{((mySiba?.cafe ?? 0) / 20) * 100}%</span>
          </div>
          <div className={stls.progressContainer}>
            <div className={stls.progressTitle}>
              <IconPark />
              <p>Парки </p>
            </div>{" "}
            <ProgressBar value={mySiba?.park ?? 0} color="#2BB26E" />
            <span>{((mySiba?.park ?? 0) / 20) * 100}%</span>
          </div>
          <div className={stls.progressContainer}>
            <div className={stls.progressTitle}>
              <IconGroomer />
              <p>Грумер </p>
            </div>
            <ProgressBar value={mySiba?.groomer ?? 0} color="#333944" />
            <span>{((mySiba?.groomer ?? 0) / 20) * 100}%</span>
          </div>
        </div>
        {error && (
          <span style={{ fontSize: "12px", color: "#E95B47" }}>{error}</span>
        )}{" "}
        {isEdit ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Button
              size="large"
              variant="secondary"
              onClick={() => {
                setIsEdit(false);
                setAvatar(null);
                setError(null);
              }}
            >
              Отмена
            </Button>
            <Button
              size="large"
              iconRight={<IconRight />}
              onClick={handleSubmit}
            >
              Сохранить
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEdit(true)} size="large">
            Редактировать профиль
          </Button>
        )}
      </div>
    </LayoutPage>
  );
};
