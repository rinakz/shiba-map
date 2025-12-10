import styles from "./input.module.sass";
import { styled, TextField } from "@mui/material";
import colors from "../../../styles/config/Color.module.sass";
import type { ChangeEventHandler, FC, ReactNode } from "react";

interface InputProps {
  label?: string;
  placeholder?: string;
  icon?: ReactNode;
  description?: string;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  value?: string;
  type?: string;
}

const CustomTextField = styled(TextField)({
  "& .MuiInputBase-root": {
    borderRadius: "20px",
    border: "none",
    fontFamily: "NunitoSans",
  },
  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
    border: `1px solid #A3A19E`,
  },
  "& .MuiOutlinedInput-root fieldset": {
    BorderColor: colors.borderColor,
  },
});

export const Input: FC<InputProps> = ({
  label,
  placeholder,
  description,
  icon,
  type,
  ...props
}) => (
  <div
    style={{
      display: "flex",
      width: "100%",
      flexDirection: "column",
      gap: "4px",
    }}
  >
    {label}
    <CustomTextField
      type={type}
      placeholder={placeholder}
      className={styles.inputContainer}
      {...props}
      slotProps={{
        input: {
          endAdornment: (
            <span
              style={{
                width: "16px",
                height: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {icon}
            </span>
          ),
        },
      }}
    />
    {description && (
      <span style={{ fontSize: "12px", color: "#65635E" }}>{description}</span>
    )}
  </div>
);
