import { FC, ButtonHTMLAttributes, ReactNode, Ref } from "react";
import cn from "classnames";
import styles from "./button.module.sass";
import { CircularProgress } from "@mui/material";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  loading?: boolean;
  variant?: string;
  size?: string;
  iconRight?: ReactNode;
  innerRef?: Ref<HTMLButtonElement>;
}

export const Button: FC<ButtonProps> = ({
  children,
  className,
  loading = false,
  variant = "primary",
  type = "button",
  size = "medium",
  iconRight,
  innerRef,
  ...props
}) => (
  <button
    disabled={loading}
    ref={innerRef}
    className={cn(className, styles.button, styles[variant], styles[size])}
    type={type}
    {...props}
  >
    {loading ? (
      <CircularProgress />
    ) : (
      <span className={styles.iconContainer}>
        {children}
        {iconRight && <span className={styles.icon}>{iconRight}</span>}
      </span>
    )}
  </button>
);
