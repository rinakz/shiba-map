import { FC, ButtonHTMLAttributes, ReactNode, Ref } from "react";
import cn from "classnames";
import styles from "./icon-button.module.sass";
import { CircularProgress } from "@mui/material";

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
}) => (
  <button
    className={cn(className, styles.button, styles[variant], styles[size])}
    type={type}
    {...props}
  >
    {loading ? <CircularProgress /> : icon}
  </button>
);
