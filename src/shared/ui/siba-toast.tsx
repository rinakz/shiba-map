import stls from "./siba-toast.module.sass";

type SibaToastProps = {
  text: string | null;
};

export const SibaToast = ({ text }: SibaToastProps) => {
  if (!text) return null;
  return <div className={stls.toast}>{text}</div>;
};

