import { Button } from "../../shared/ui";
import { IconRight } from "../../shared/icons";
import stls from "./profile.module.sass";

type ProfileBottomActionsProps = {
  isEdit: boolean;
  isSavingProfile: boolean;
  isSigningOut: boolean;
  onCancelEdit: () => void;
  onSave: () => void;
  onOpenDelete: () => void;
  onSignOut: () => void;
};

export const ProfileBottomActions = ({
  isEdit,
  isSavingProfile,
  isSigningOut,
  onCancelEdit,
  onSave,
  onOpenDelete,
  onSignOut,
}: ProfileBottomActionsProps) => {
  return (
    <>
      {isEdit ? (
        <div className={stls.editActions}>
          <Button
            size="large"
            variant="secondary"
            disabled={isSavingProfile}
            onClick={onCancelEdit}
          >
            Отмена
          </Button>
          <Button
            size="large"
            loading={isSavingProfile}
            iconRight={<IconRight />}
            onClick={onSave}
          >
            Сохранить
          </Button>
        </div>
      ) : null}
      <div className={stls.bottomActions}>
        {!isEdit && (
          <Button
            size="medium"
            className={stls.fullWidth}
            variant="secondary"
            onClick={onOpenDelete}
          >
            Удалить аккаунт
          </Button>
        )}
        {!isEdit && (
          <Button
            size="medium"
            className={stls.fullWidth}
            iconRight={<IconRight />}
            loading={isSigningOut}
            onClick={onSignOut}
          >
            Выйти
          </Button>
        )}
      </div>
    </>
  );
};
