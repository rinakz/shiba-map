import nunitoTtfUrl from "../../styles/fonts/NunitoSans.ttf?url";

type PdfPayload = {
  sibaName: string;
  photoUrl?: string | null;
  currentWeight?: number | null;
  vaccines: Array<{ title: string; value: string }>;
  medicalFeatures: string[];
  note?: string | null;
};

type JsPdfCtor = new (options?: { unit?: string; format?: string }) => {
  addFileToVFS: (name: string, data: string) => void;
  addFont: (file: string, family: string, style: string) => void;
  setFont: (family: string, style?: string) => void;
  setFontSize: (size: number) => void;
  text: (text: string, x: number, y: number) => void;
  setDrawColor: (r: number, g: number, b: number) => void;
  line: (x1: number, y1: number, x2: number, y2: number) => void;
  addImage: (imageData: string, format: "PNG" | "JPEG", x: number, y: number, w: number, h: number) => void;
  save: (filename: string) => void;
};

declare global {
  interface Window {
    jspdf?: { jsPDF: JsPdfCtor };
    Telegram?: { WebApp?: { showConfirm?: (text: string, cb: (ok: boolean) => void) => void } };
  }
}

const ensureJsPdf = async (): Promise<JsPdfCtor> => {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Не удалось загрузить jsPDF"));
    document.body.appendChild(script);
  });
  if (!window.jspdf?.jsPDF) throw new Error("jsPDF недоступен");
  return window.jspdf.jsPDF;
};

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return window.btoa(binary);
};

const toDataUrl = async (url: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Не удалось прочитать изображение"));
    reader.readAsDataURL(blob);
  });
};

export const confirmPdfGeneration = async () => {
  if (window.Telegram?.WebApp?.showConfirm) {
    return await new Promise<boolean>((resolve) => {
      window.Telegram?.WebApp?.showConfirm?.("Сформировать PDF-выписку для ветеринара?", (ok) => resolve(Boolean(ok)));
    });
  }
  return window.confirm("Сформировать PDF-выписку для ветеринара?");
};

export const generateHealthPassPdf = async (payload: PdfPayload) => {
  const JsPDF = await ensureJsPdf();
  const doc = new JsPDF({ unit: "mm", format: "a4" });

  const fontBuffer = await fetch(nunitoTtfUrl).then((r) => r.arrayBuffer());
  const base64Font = arrayBufferToBase64(fontBuffer);
  doc.addFileToVFS("NunitoSans.ttf", base64Font);
  doc.addFont("NunitoSans.ttf", "NunitoSans", "normal");
  doc.setFont("NunitoSans", "normal");

  doc.setFontSize(18);
  doc.text("SIBINATOR", 15, 16);
  doc.setFontSize(12);
  doc.text("Медпаспорт", 150, 16);
  doc.setDrawColor(210, 210, 210);
  doc.line(15, 20, 195, 20);

  if (payload.photoUrl) {
    try {
      const photo = await toDataUrl(payload.photoUrl);
      const fmt: "PNG" | "JPEG" = payload.photoUrl.toLowerCase().endsWith(".png") ? "PNG" : "JPEG";
      doc.addImage(photo, fmt, 15, 26, 30, 30);
    } catch {
      // ignore image errors in export
    }
  }

  doc.setFontSize(14);
  doc.text(`Собака: ${payload.sibaName}`, 50, 32);
  doc.setFontSize(12);
  doc.text(`Текущий вес: ${payload.currentWeight ?? "-"} кг`, 50, 40);

  doc.setFontSize(13);
  doc.text("Вакцинации и обработки", 15, 64);
  doc.setDrawColor(220, 220, 220);
  doc.line(15, 67, 195, 67);
  let y = 75;
  payload.vaccines.forEach((row) => {
    doc.setFontSize(11);
    doc.text(`${row.title}: ${row.value || "-"}`, 18, y);
    y += 8;
  });

  y += 6;
  doc.setFontSize(13);
  doc.text("Аллергии и особенности", 15, y);
  y += 6;
  doc.line(15, y, 195, y);
  y += 8;
  const features = payload.medicalFeatures.length ? payload.medicalFeatures : ["Нет отметок"];
  features.forEach((item) => {
    doc.setFontSize(11);
    doc.text(`- ${item}`, 18, y);
    y += 7;
  });
  if (payload.note) {
    y += 4;
    doc.text(`Примечание: ${payload.note}`, 18, y);
  }

  doc.save(`medpassport-${payload.sibaName}.pdf`);
};

