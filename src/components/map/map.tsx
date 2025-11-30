import { Typography } from "@mui/material";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import GeneralMap from "./general-map";
import { IconRight } from "../../assets/icons/IconRight";

const CODE = "сибики";

export default function Map() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setError(false);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (password === CODE) {
      localStorage.setItem("code", CODE);
      setSuccess(true);
    } else {
      setError(true);
    }
  };

  useEffect(() => {
    const code = localStorage.getItem("code");
    if (code) {
      setSuccess(true);
    }
  }, []);

  return (
    <>
      {success ? (
        <GeneralMap />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "32px",
            alignItems: "center",
            width: "100%",
            marginTop: "112px",
          }}
        >
          <Typography variant="h5">Введите кодовое слово:</Typography>
          <form style={{ display: "flex", gap: "16px" }} onSubmit={onSubmit}>
            <input type="text" onChange={onChange} />
            <button
              style={{
                cursor: "pointer",
                background: "transparent",
                border: "none",
              }}
              type="submit"
            >
              <IconRight />
            </button>
          </form>
          {error && (
            <span style={{ color: "#E95B47" }}>Неверное кодовое слово</span>
          )}
        </div>
      )}
    </>
  );
}
