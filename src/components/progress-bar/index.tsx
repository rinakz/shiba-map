import { LinearProgress, Box } from "@mui/material";
import { styled } from "@mui/system";

const CustomLinearProgress = styled(LinearProgress)(({ color }) => ({
  height: "24px",
  borderRadius: "20px",
  backgroundColor: "#EEEADE", // Цвет линии под ней с прозрачностью 50%

  "& .MuiLinearProgress-bar": {
    backgroundColor: color, // Цвет закрашенной верхней линии
  },
}));

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
        color={color}
      />
    </Box>
  );
};
