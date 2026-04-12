import Skeleton from "@mui/material/Skeleton";

export const NewsFeedLoading = () => {
  return (
    <>
      <Skeleton variant="rounded" height={112} sx={{ mb: 1.5 }} />
      <Skeleton variant="rounded" height={112} sx={{ mb: 1.5 }} />
      <Skeleton variant="rounded" height={112} />
    </>
  );
};
