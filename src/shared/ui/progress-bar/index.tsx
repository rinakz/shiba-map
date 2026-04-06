import { LinearProgress, Box } from "@mui/material";
import { styled } from "@mui/system";

type CustomLinearProgressProps = {
  customColor: string;
};

const CustomLinearProgress = styled(LinearProgress, {
  shouldForwardProp: (prop) => prop !== "customColor",
})<CustomLinearProgressProps>(({ customColor }) => ({
  height: "24px",
  borderRadius: "20px",
  backgroundColor: "#EEEADE",
  "& .MuiLinearProgress-bar": {
    backgroundColor: customColor,
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
      <CustomLinearProgress variant="determinate" value={percentage} customColor={color} />
    </Box>
  );
};
