import { Controller, type Control } from "react-hook-form";
import { IconRight } from "../../shared/icons/IconRight";
import { Button, Input } from "../../shared/ui";
import { IconButton } from "../../shared/ui/icon-button/icon-button";
import { IconMale } from "../../shared/icons/IconMale";
import { IconFemale } from "../../shared/icons/IconFemale";
import { IconSibka } from "../../shared/icons/IconSibka";
import { IconSibkaWhite } from "../../shared/icons/IconSibkaWhite";
import { IconSibkaBlack } from "../../shared/icons/IconSibkaBlack";
import type { AccountType, AuthFormType } from "../../pages/auth-page/types";
import { useEffect, useMemo, useRef, useState, type FC } from "react";
import cn from "classnames";
import stls from "./auth.module.sass";

interface FirstStepProps {
  control: Control<AuthFormType>;
  setActiveStep: (value: number) => void;
  formData: AuthFormType;
  accountType: AccountType;
  onAccountTypeChange: (value: AccountType) => void;
  kennelLogoFile: File | null;
  onKennelLogoChange: (file: File | null) => void;
}

export const FirstStep: FC<FirstStepProps> = ({
  control,
  setActiveStep,
  formData,
  accountType,
  onAccountTypeChange,
  kennelLogoFile,
  onKennelLogoChange,
}) => {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const kennelLogoPreviewUrl = useMemo(() => {
    if (!kennelLogoFile) return null;
    return URL.createObjectURL(kennelLogoFile);
  }, [kennelLogoFile]);

  useEffect(() => {
    return () => {
      if (kennelLogoPreviewUrl) URL.revokeObjectURL(kennelLogoPreviewUrl);
    };
  }, [kennelLogoPreviewUrl]);

  const handleNextStep = () => {
    setError(null);
    if (accountType === "owner") {
      if (formData.sibaname && formData.gender && formData.icon) {
        setActiveStep(2);
      } else {
        setError("Заполните все поля");
      }
      return;
    }
    if (formData.sibaname.trim() && formData.kennelCity.trim()) {
      setActiveStep(2);
    } else {
      setError("Заполните название питомника и город");
    }
  };

  return (
    <div className={stls.stepContainer}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className={stls.accountSegment} role="tablist" aria-label="Тип аккаунта">
          <button
            type="button"
            role="tab"
            aria-selected={accountType === "owner"}
            className={cn(
              stls.accountSegmentTab,
              accountType === "owner" && stls.accountSegmentTabActive,
            )}
            onClick={() => onAccountTypeChange("owner")}
          >
            Я владелец
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={accountType === "breeder"}
            className={cn(
              stls.accountSegmentTab,
              accountType === "breeder" && stls.accountSegmentTabActive,
            )}
            onClick={() => onAccountTypeChange("breeder")}
          >
            Я заводчик
          </button>
        </div>

        {accountType === "owner" ? (
          <div
            key="owner-fields"
            className={stls.accountFieldsFade}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <Controller
              control={control}
              name="sibaname"
              render={({ field }) => (
                <Input
                  label="Кличка Вашего питомца"
                  onChange={(e) => field.onChange(e)}
                  value={field.value}
                  placeholder="Введите кличку"
                  description="Больше питомцев, можно добавить в личном кабинете"
                />
              )}
            />

            <div
              style={{ display: "flex", flexDirection: "column", gap: "40px" }}
            >
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <div style={{ display: "flex", gap: "20px" }}>
                    <IconButton
                      variant={field.value === "male" ? "pressed" : "primary"}
                      onClick={() => field.onChange("male")}
                      size="large"
                      icon={<IconMale />}
                    />
                    <IconButton
                      variant={field.value === "female" ? "pressed" : "primary"}
                      onClick={() => field.onChange("female")}
                      size="large"
                      icon={<IconFemale />}
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="icon"
                render={({ field }) => (
                  <div
                    style={{ display: "flex", gap: "20px", cursor: "pointer" }}
                  >
                    <IconButton
                      size="large"
                      variant={field.value === "default" ? "pressed" : "primary"}
                      onClick={() => field.onChange("default")}
                      icon={<IconSibka />}
                    />
                    <IconButton
                      size="large"
                      variant={field.value === "white" ? "pressed" : "primary"}
                      onClick={() => field.onChange("white")}
                      icon={<IconSibkaWhite />}
                    />
                    <IconButton
                      size="large"
                      variant={field.value === "black" ? "pressed" : "primary"}
                      onClick={() => field.onChange("black")}
                      icon={<IconSibkaBlack />}
                    />
                  </div>
                )}
              />
            </div>
          </div>
        ) : (
          <div
            key="breeder-fields"
            className={stls.accountFieldsFade}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <Controller
              control={control}
              name="sibaname"
              render={({ field }) => (
                <Input
                  label="Название питомника"
                  onChange={(e) => field.onChange(e)}
                  value={field.value}
                  placeholder="Введите название"
                />
              )}
            />
            <Controller
              control={control}
              name="kennelCity"
              render={({ field }) => (
                <Input
                  label="Город"
                  onChange={(e) => field.onChange(e)}
                  value={field.value}
                  placeholder="Город питомника"
                />
              )}
            />
            <Controller
              control={control}
              name="kennelPrefix"
              render={({ field }) => (
                <Input
                  label="Приставка питомника (если есть)"
                  onChange={(e) => field.onChange(e)}
                  value={field.value}
                  placeholder="Например, официальный префикс кличек"
                />
              )}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontSize: "14px", color: "#2E2D30" }}>
                Логотип питомника
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={stls.kennelLogoInput}
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  onKennelLogoChange(f);
                }}
              />
              <div className={stls.kennelLogoRow}>
                <div className={stls.kennelLogoPreview}>
                  {kennelLogoPreviewUrl ? (
                    <img src={kennelLogoPreviewUrl} alt="" />
                  ) : (
                    <span className={stls.kennelLogoPlaceholder}>Нет файла</span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="medium"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Выбрать файл
                </Button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <span style={{ fontSize: "12px", color: "#E95B47" }}>{error}</span>
        )}
      </div>
      <Button iconRight={<IconRight />} onClick={handleNextStep} size="large">
        Продолжить
      </Button>
    </div>
  );
};
