import { useContext, useEffect, useState } from "react";
import { LayoutPage } from "../general/layout-page";
import { AppContext } from "../context/app-context";
import { IconPeople } from "../../assets/icons/IconPeople";
import { IconChat } from "../../assets/icons/IconChat";
import { IconTg } from "../../assets/icons/IconTg";
import { useParams } from "react-router-dom";
import type { ShibaType } from "../../types";
import { supabase } from "../../api/supabase-сlient";

export const Siba = () => {
  const { sibaIns } = useContext(AppContext);
  const { id } = useParams();
  const [sibaUser, setSibaUser] = useState();

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
      <div
        style={{
          marginTop: "112px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            justifyContent: "flex-start",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconPeople /> {sibaUser?.nickname}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconChat />
            {sibaUser?.telegram_chat}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconTg />
            {sibaUser?.is_show_tgname ? sibaUser?.tgname : "Информация скрыта"}
          </div>
        </div>
        <img
          style={{ width: 92, height: 92 }}
          src={`/${siba?.siba_icon}.png`}
        />
        <h1 style={{ fontSize: 64 }}>{siba?.siba_name}</h1>
      </div>
    </LayoutPage>
  );
};
