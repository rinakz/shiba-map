import Friends from "./friends";
import Coffee from "./cofee";
import Community from "./community";
import { Tour } from "../tour";

export const Main = () => {
  const isAuthUser = undefined;

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
