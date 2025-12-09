import { useContext, useState, type ChangeEvent } from "react";
import { LayoutPage } from "../general/layout-page";
import { AppContext } from "../context/app-context";
import { IconPeople } from "../../assets/icons/IconPeople";
import { IconChat } from "../../assets/icons/IconChat";
import { IconTg } from "../../assets/icons/IconTg";
import { ProgressBar } from "../progress-bar";
import stls from "./profile.module.sass";
import { IconCafe } from "../../assets/icons/IconCafe";
import { IconPark } from "../../assets/icons/IconPark";
import { IconGroomer } from "../../assets/icons/IconGroomer";
import { Button } from "../../ui";
import { IconRight } from "../../assets/icons/IconRight";
import { IconAvatar } from "../../assets/icons/IconAvatar";
import { supabase } from "../../api/supabase-сlient";

export const Profile = () => {
  const { mySiba, user } = useContext(AppContext);

  const [avatar, setAvatar] = useState<string | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            alignItems: "center",
            width: "100%",
          }}
        >
          {isEdit ? (
            <div style={{ position: "relative" }}>
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  style={{
                    width: "200px",
                    height: "200px",
                    borderRadius: "20px",
                    objectFit: "cover",
                    marginBottom: "10px",
                  }}
                />
              ) : mySiba.photo ? (
                <img
                  style={{ width: "200px", height: "200px" }}
                  src={`/${mySiba?.siba_icon}.png`}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "200px",
                    height: "200px",
                    borderRadius: "20px",
                    backgroundColor: "rgba(255, 252, 245, 0.5)",
                    marginBottom: "10px",
                  }}
                >
                  <IconAvatar />
                </div>
              )}
              <input
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 200,
                  height: 200,
                  opacity: 0,
                }}
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
            <ProgressBar value={mySiba.cafe ?? 0} color="#7A7B7B" />
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
            <ProgressBar value={mySiba.groomer ?? 0} color="#333944" />
            <span>{((mySiba.groomer ?? 0) / 20) * 100}%</span>
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
