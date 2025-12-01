import Friends from "./friends";
import Coffee from "./cofee";
import Community from "./community";
import { Tour } from "../tour";
import { USER_LOCALSTORAGE } from "../../constants/constants";

export const Main = () => {
  const isAuthUser = localStorage.getItem(USER_LOCALSTORAGE);

  return (
    <>
      {isAuthUser ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "60px",
            height: "100%",
          }}
        >
          Добро пожаловать!
          <Friends />
          <Coffee />
          <Community />
        </div>
      ) : (
        <Tour />
      )}
    </>
  );
};
