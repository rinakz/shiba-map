import { useContext } from "react";
import { LayoutPage } from "../general/layout-page";
import { AppContext } from "../context/app-context";
import { IconPeople } from "../../assets/icons/IconPeople";
import { IconChat } from "../../assets/icons/IconChat";
import { IconTg } from "../../assets/icons/IconTg";

export const Profile = () => {
  const { mySiba, user } = useContext(AppContext);

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
            <IconPeople /> {user.nickname}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconChat />
            {user.is_show_tgname ? user.telegram_chat : "Информация скрыта"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconTg />
            {user.is_show_tgname ? user.tgname : "Информация скрыта"}
          </div>
        </div>
        <img
          style={{ width: 92, height: 92 }}
          src={`${mySiba.siba_icon}.png`}
        />
        <h1 style={{ fontSize: 64 }}>{mySiba.siba_name}</h1>
      </div>
    </LayoutPage>
  );
};
