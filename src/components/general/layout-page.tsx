import { useState, useEffect } from "react";
import stls from "~styles/components/LayoutPage.module.sass";
import useWindowSize from "~hooks/use-window-size";

type TypeLayoutPageProps = {
  children: any;
  classNames?: any;
  column?: boolean;
  style?: any;
};

export function LayoutPage({ children, column, style }: TypeLayoutPageProps) {
  const { width } = useWindowSize();

  const [laptop, setLaptop] = useState(false);

  useEffect(() => {
    setLaptop(width < 900);
  }, [width]);

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
}
