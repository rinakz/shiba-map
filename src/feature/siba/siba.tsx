import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../shared/context/app-context";
import { IconPeople } from "../../shared/icons/IconPeople";
import { IconChat } from "../../shared/icons/IconChat";
import { IconTg } from "../../shared/icons/IconTg";
import type { ShibaType, ShibaUser } from "../../types";
import { supabase } from "../../shared/api/supabase-сlient";
import stls from "../siba/siba.module.sass";
import { IconCafe } from "../../shared/icons/IconCafe";
import { IconPark } from "../../shared/icons/IconPark";
import { IconGroomer } from "../../shared/icons/IconGroomer";
import { LayoutPage, ProgressBar } from "../../shared/ui";

type SibaProps = {
  id: string;
};

export const Siba = ({ id }: SibaProps) => {
  const { sibaIns } = useContext(AppContext);
  const [sibaUser, setSibaUser] = useState<ShibaUser>();

  const siba = sibaIns.find((el: ShibaType) => el.id == id);

  const getUserByUserSibaId = async () => {
    if (siba) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", siba.siba_user_id);

      if (error) {
        console.error("Ошибка при получении пользователя:", error);
        return null;
      }

      setSibaUser(data[0]);
    }
  };

  useEffect(() => {
    if (siba) {
      getUserByUserSibaId();
    }
  }, [siba]);

  return (
    <LayoutPage>
      <div style={{ minWidth: "300px" }} className={stls.profileContainer}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            alignItems: "center",
            width: "100%",
          }}
        >
          <img
            style={{ width: 92, height: 92 }}
            src={`/${siba?.siba_icon}.png`}
          />
          <h1 style={{ fontSize: 64 }}>{siba?.siba_name}</h1>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <span style={{ color: "#74736E" }}>
              {siba?.siba_gender === "male" ? "Мальчик" : "Девочка"}
            </span>
            <span style={{ color: "#74736E" }}>level: {siba?.level ?? 0}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <span>Подписки: {siba?.followers ?? 0}</span>{" "}
            <span>Подписчики: {siba?.followings ?? 0}</span>
          </div>
        </div>
        <div
          style={{ flexDirection: "column", background: "#FEAE11" }}
          className={stls.ownerCard}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconPeople /> {sibaUser?.nickname}
          </div>
          <div className={stls.ownerInfo}>
            <IconChat />
            {sibaUser?.is_show_tgname
              ? sibaUser?.telegram_chat
              : "Информация скрыта"}
          </div>
          <div className={stls.ownerInfo}>
            <IconTg />
            {sibaUser?.is_show_tgname ? sibaUser?.tgname : "Информация скрыта"}
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
          <div
            style={{ background: "#FEAE11" }}
            className={stls.progressContainer}
          >
            <div className={stls.progressTitle}>
              <IconCafe />
              <p>Кафе</p>
            </div>
            <ProgressBar value={siba?.cafe ?? 0} color="#7A7B7B" />
            <span>{((siba?.cafe ?? 0) / 20) * 100}%</span>
          </div>
          <div
            style={{ background: "#FEAE11" }}
            className={stls.progressContainer}
          >
            <div className={stls.progressTitle}>
              <IconPark />
              <p>Парки </p>
            </div>{" "}
            <ProgressBar value={siba?.park ?? 0} color="#2BB26E" />
            <span>{((siba?.park ?? 0) / 20) * 100}%</span>
          </div>
          <div
            style={{ background: "#FEAE11" }}
            className={stls.progressContainer}
          >
            <div className={stls.progressTitle}>
              <IconGroomer />
              <p>Грумер </p>
            </div>
            <ProgressBar value={siba?.groomer ?? 0} color="#333944" />
            <span>{((siba?.groomer ?? 0) / 20) * 100}%</span>
          </div>
        </div>
      </div>
    </LayoutPage>
  );
};
