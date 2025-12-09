import { LinearProgress, Box } from "@mui/material";
import { styled } from "@mui/system";

type CustomLinearProgressProps = {
  customColor: string;
};

const CustomLinearProgress = styled(LinearProgress)(
  ({ customColor }: CustomLinearProgressProps) => ({
    height: "24px",
    borderRadius: "20px",
    backgroundColor: "#EEEADE", // Цвет линии под ней с прозрачностью 50%

    "& .MuiLinearProgress-bar": {
      backgroundColor: customColor, // Цвет закрашенной верхней линии
    },
  })
);

type ProgressBarType = {
  value: number;
  color: string;
};

export const ProgressBar = ({ value, color }: ProgressBarType) => {
  const percentage = (value / 20) * 100;

  return (
    <Box sx={{ width: "100%" }}>
      <CustomLinearProgress
        variant="determinate"
        value={percentage}
        customColor={color}
      />
    </Box>
  );
};
