import { type ReactElement } from "react";
import stls from "./layoutPage.module.sass";
import useWindowSize from "../../hooks/use-window-size";

type TypeLayoutPageProps = {
  children: ReactElement;
  classNames?: string;
  column?: boolean;
  style?: object;
};

export const LayoutPage = ({
  children,
  column,
  style,
}: TypeLayoutPageProps) => {
  const { width } = useWindowSize();
  const laptop = typeof width === "number" && width < 900;

  return (
    <div
      className={stls.container}
      style={{
        ...style,
        display: "flex",
        flexWrap: laptop && !column ? "wrap" : "nowrap",
        flexDirection: column ? "column" : "row",
      }}
    >
      {children}
    </div>
  );
};
