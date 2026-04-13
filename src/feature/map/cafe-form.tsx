import { useState, type ChangeEvent } from "react";
import { Button, Input } from "../../shared/ui";
import { Checkbox } from "@mui/material";
import { supabase } from "../../shared/api/supabase-сlient";
import { uploadImageFileLikePlaceForm } from "../../shared/utils/places-bucket-upload";
import { useContext } from "react";
import { AppContext } from "../../shared/context/app-context";
import type { ShibaType } from "../../shared/types";

type CafeFormProps = {
  coordinates: number[];
  onClose: () => void;
};

export const CafeForm = ({ coordinates, onClose }: CafeFormProps) => {
  const { authUserId, mySiba, setMySiba, user } = useContext(AppContext);
  const isBreederAccount = user?.account_type === "breeder";
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [withVisit, setWithVisit] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && !file.type.startsWith("image/")) {
      setError("Можно загружать только изображения");
      return;
    }
    setError(null);
    setPhotoFile(file);
  };

  const handleSave = async () => {
    setError(null);
    if (!name || !address) {
      setError("Введите название и адрес");
      return;
    }
    setIsSaving(true);
    try {
      let photoUrl: string | null = null;
      if (photoFile) {
        photoUrl = await uploadImageFileLikePlaceForm(authUserId, photoFile);
      }

      const { data: cafe, error: cafeErr } = await supabase
        .from("cafes")
        .insert([
          {
            name,
            address,
            coordinates,
            photo: photoUrl,
            created_by: authUserId ?? null,
          },
        ])
        .select("*")
        .single();
      if (cafeErr) throw cafeErr;

      if (mySiba?.id) {
        const { data: refreshedAfterPlace } = await supabase
          .from("siba_map_markers")
          .select("*")
          .eq("id", mySiba.id)
          .maybeSingle();
        if (refreshedAfterPlace) setMySiba(refreshedAfterPlace as ShibaType);
      }

      if (withVisit && mySiba?.id && !isBreederAccount) {
        await supabase.from("siba_cafe_visits").insert([
          {
            cafe_id: cafe.id,
            siba_id: mySiba.id,
            visited_at: new Date().toISOString(),
          },
        ]);
        const { data: refreshed } = await supabase
          .from("siba_map_markers")
          .select("*")
          .eq("id", mySiba.id)
          .maybeSingle();
        if (refreshed) setMySiba(refreshed as ShibaType);
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h3>Добавить кафе/ресторан</h3>
      <Input label="Название" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Адрес" value={address} onChange={(e) => setAddress(e.target.value)} />
      <input type="file" accept="image/*" onChange={onPhotoChange} />
      {!isBreederAccount ? (
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Checkbox checked={withVisit} onChange={(e) => setWithVisit(e.target.checked)} />
          Мой питомец был здесь
        </label>
      ) : null}
      {error && <span style={{ fontSize: 12, color: "#E95B47" }}>{error}</span>}
      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="secondary" onClick={onClose} disabled={isSaving}>
          Отмена
        </Button>
        <Button onClick={handleSave} loading={isSaving}>
          Сохранить
        </Button>
      </div>
    </div>
  );
};
