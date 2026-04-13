import cn from "classnames";
import styles from "./button.module.sass";
import { CircularProgress } from "@mui/material";
import type { ButtonHTMLAttributes, FC, ReactNode, Ref } from "react";

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
  disabled,
  ...props
}) => {
  const progressColor =
    variant === "secondary" ? "#FEAE11" : "#FFFCF5";
  return (
    <button
      disabled={loading || disabled}
      ref={innerRef}
      className={cn(className, styles.button, styles[variant], styles[size])}
      type={type}
      {...props}
    >
      {loading ? (
        <CircularProgress size={20} sx={{ color: progressColor }} />
      ) : (
        <span className={styles.iconContainer}>
          {children}
          {iconRight && <span className={styles.icon}>{iconRight}</span>}
        </span>
      )}
    </button>
  );
};
