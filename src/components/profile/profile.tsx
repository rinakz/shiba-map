// import { Checkbox } from "@mui/material";
// import { Controller, useForm } from "react-hook-form";
import { LayoutPage } from "../general/layout-page";

// const label = { inputProps: { "aria-label": "Checkbox demo" } };

export const Profile = () => {
  return (
    <LayoutPage>
      <div
        style={{
          width: "-webkit-fill-available",
          height: "fit-content",
          maxWidth: "500px",
          marginTop: "112px",
        }}
      >
        в разработке...
        <img width="100%" src="sticker.gif" alt="in-processing" />
      </div>
      {/* <form
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          width: "100%",
        }}
      >
        <h1 style={{ marginBottom: "12px", fontSize: "46px" }}>Регистрация</h1>
        <div style={{ display: "flex", flexDirection: "column" }}>
          никнейм
          <Controller
            control={control}
            name="nickname"
            render={({ field }) => (
              <input onChange={(e) => field.onChange(e)} value={field.value} />
            )}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          пароль
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <input onChange={(e) => field.onChange(e)} value={field.value} />
            )}
          />
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            имя пользователя в телеграмм
            <Controller
              control={control}
              name="tgname"
              render={({ field }) => (
                <input
                  onChange={(e) => field.onChange(e)}
                  value={field.value.name}
                />
              )}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <span>Показывать имя</span>
            <Controller
              control={control}
              name="tgname"
              render={({ field }) => (
                <Checkbox
                  {...label}
                  value={field.value.show}
                  checked={field.value.show}
                  onChange={(e) => field.onChange(e)}
                  color="default"
                />
              )}
            />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          чат в телеграмм
          <Controller
            control={control}
            name="chat"
            render={({ field }) => (
              <input onChange={(e) => field.onChange(e)} value={field.value} />
            )}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          имя питомца
          <Controller
            control={control}
            name="sibaname"
            render={({ field }) => (
              <input onChange={(e) => field.onChange(e)} value={field.value} />
            )}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span>иконка на карте</span>
          <Controller
            control={control}
            name="icon"
            render={({ field }) => (
              <div style={{ display: "flex", gap: "12px" }}>
                <img
                  style={{
                    border:
                      field.value === "default" ? "1px solid green" : "none",
                  }}
                  onClick={() => field.onChange("default")}
                  src="/sibka.png"
                  alt="default"
                  width={60}
                  height={60}
                />
                <img
                  style={{
                    border:
                      field.value === "white" ? "1px solid green" : "none",
                  }}
                  onClick={() => field.onChange("white")}
                  src="/sibka-wht.png"
                  alt="white"
                  width={60}
                  height={60}
                />
                <img
                  style={{
                    border:
                      field.value === "black" ? "1px solid green" : "none",
                  }}
                  onClick={() => field.onChange("black")}
                  src="/sibka-blk.png"
                  alt="black"
                  width={60}
                  height={60}
                />
              </div>
            )}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          геолокация
          <Maps />
        </div>
      </form> */}
    </LayoutPage>
  );
};
