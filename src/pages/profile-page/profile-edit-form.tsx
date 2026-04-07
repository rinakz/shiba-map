import cn from "classnames";
import { Checkbox } from "@mui/material";
import {
  IconFemale,
  IconMale,
  IconPeople,
  IconSibka,
  IconSibkaBlack,
  IconSibkaWhite,
} from "../../shared/icons";
import { Button, IconButton, Input } from "../../shared/ui";
import stls from "./profile.module.sass";

type ProfileEditFormProps = {
  authUserId: string | null;
  communityAvatarInputRef: React.RefObject<HTMLInputElement | null>;
  nicknameDraft: string;
  tgNameDraft: string;
  isShowTgNameDraft: boolean;
  sibaNameDraft: string;
  sibaGenderDraft: string;
  sibaIconDraft: string;
  communityTitleDraft: string;
  communityLinkDraft: string;
  communityAvatarDraft: string;
  communityAvatarPreviewUrl: string | null;
  onNicknameChange: (value: string) => void;
  onTgNameChange: (value: string) => void;
  onShowTgNameChange: (checked: boolean) => void;
  onSibaNameChange: (value: string) => void;
  onSibaGenderChange: (value: string) => void;
  onSibaIconChange: (value: string) => void;
  onCommunityTitleChange: (value: string) => void;
  onCommunityLinkChange: (value: string) => void;
  onOpenCommunityAvatarPicker: () => void;
  onCommunityAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearCommunity: () => Promise<void>;
};

export const ProfileEditForm = ({
  authUserId,
  communityAvatarInputRef,
  nicknameDraft,
  tgNameDraft,
  isShowTgNameDraft,
  sibaNameDraft,
  sibaGenderDraft,
  sibaIconDraft,
  communityTitleDraft,
  communityLinkDraft,
  communityAvatarDraft,
  communityAvatarPreviewUrl,
  onNicknameChange,
  onTgNameChange,
  onShowTgNameChange,
  onSibaNameChange,
  onSibaGenderChange,
  onSibaIconChange,
  onCommunityTitleChange,
  onCommunityLinkChange,
  onOpenCommunityAvatarPicker,
  onCommunityAvatarChange,
  onClearCommunity,
}: ProfileEditFormProps) => {
  return (
    <div className={stls.editForm}>
      <Input
        label="Никнейм владельца"
        value={nicknameDraft}
        onChange={(e) => onNicknameChange(e.target.value)}
      />
      <Input
        label="Telegram username"
        value={tgNameDraft}
        onChange={(e) => onTgNameChange(e.target.value)}
      />
      <label className={stls.checkRow}>
        <Checkbox
          checked={isShowTgNameDraft}
          onChange={(e) => onShowTgNameChange(e.target.checked)}
        />
        Показывать telegram-имя
      </label>
      <Input
        label="Кличка сибы"
        value={sibaNameDraft}
        onChange={(e) => onSibaNameChange(e.target.value)}
      />
      <div className={stls.communityCard}>
        <div className={stls.communityCardHeader}>Сообщество</div>
        <div
          className={stls.communityAvatarPicker}
          onClick={onOpenCommunityAvatarPicker}
        >
          {communityAvatarPreviewUrl ? (
            <img
              className={stls.communityAvatarImage}
              src={communityAvatarPreviewUrl}
              alt="Аватар сообщества"
            />
          ) : communityAvatarDraft ? (
            <img
              className={stls.communityAvatarImage}
              src={communityAvatarDraft}
              alt="Аватар сообщества"
            />
          ) : (
            <div className={stls.communityAvatarPlaceholder}>
              <IconPeople />
            </div>
          )}
          <input
            ref={communityAvatarInputRef}
            className={stls.inputPhoto}
            type="file"
            accept="image/*"
            onChange={onCommunityAvatarChange}
          />
        </div>
        <Input
          label="Название сообщества"
          placeholder="Shiba Club Moscow"
          value={communityTitleDraft}
          onChange={(e) => onCommunityTitleChange(e.target.value)}
        />
        <Input
          label="Ссылка на сообщество"
          placeholder="https://t.me/..."
          value={communityLinkDraft}
          onChange={(e) => onCommunityLinkChange(e.target.value)}
        />
        <Button
          size="medium"
          variant="secondary"
          onClick={onClearCommunity}
          disabled={!authUserId}
        >
          Удалить сообщество
        </Button>
      </div>
      <div className={stls.fieldGroup}>
        Пол сибы
        <div className={stls.iconRow}>
          <IconButton
            variant={sibaGenderDraft === "male" ? "pressed" : "primary"}
            onClick={() => onSibaGenderChange("male")}
            size="large"
            icon={<IconMale />}
          />
          <IconButton
            variant={sibaGenderDraft === "female" ? "pressed" : "primary"}
            onClick={() => onSibaGenderChange("female")}
            size="large"
            icon={<IconFemale />}
          />
        </div>
      </div>
      <div className={stls.fieldGroup}>
        Цвет сибы
        <div className={cn(stls.iconRow, stls.iconRowClickable)}>
          <IconButton
            size="large"
            variant={sibaIconDraft === "default" ? "pressed" : "primary"}
            onClick={() => onSibaIconChange("default")}
            icon={<IconSibka />}
          />
          <IconButton
            size="large"
            variant={sibaIconDraft === "white" ? "pressed" : "primary"}
            onClick={() => onSibaIconChange("white")}
            icon={<IconSibkaWhite />}
          />
          <IconButton
            size="large"
            variant={sibaIconDraft === "black" ? "pressed" : "primary"}
            onClick={() => onSibaIconChange("black")}
            icon={<IconSibkaBlack />}
          />
        </div>
      </div>
    </div>
  );
};
