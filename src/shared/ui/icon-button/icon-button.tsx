import cn from "classnames";
import styles from "./icon-button.module.sass";
import { CircularProgress } from "@mui/material";
import type { ButtonHTMLAttributes, FC, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  loading?: boolean;
  size?: string;
  icon: ReactNode;
  variant?: string;
}

export const IconButton: FC<ButtonProps> = ({
  className,
  loading = false,
  type = "button",
  size = "medium",
  variant = "primary",
  icon,
  ...props
}) => {
  const progressColor =
    variant === "secondary" ? "#FEAE11" : "#FFFCF5";
  return (
    <button
      className={cn(className, styles.button, styles[variant], styles[size])}
      type={type}
      {...props}
    >
      {loading ? (
        <CircularProgress size={22} sx={{ color: progressColor }} />
      ) : (
        icon
      )}
    </button>
  );
};
