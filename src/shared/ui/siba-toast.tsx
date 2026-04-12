import stls from "./siba-toast.module.sass";

type SibaToastProps = {
  text: string | null;
};

export const SibaToast = ({ text }: SibaToastProps) => {
  if (!text) return null;
  const lowered = text.toLowerCase();
  const isError =
    lowered.includes("не удалось") ||
    lowered.includes("ошибка") ||
    lowered.includes("срок истек");

  return (
    <div className={`${stls.toast} ${isError ? stls.toastError : stls.toastSuccess}`}>
      <span className={stls.toastIcon} aria-hidden="true">
        {isError ? "!" : "✓"}
      </span>
      <span>{text}</span>
    </div>
  );
};

