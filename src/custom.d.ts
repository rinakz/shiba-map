/// <reference types="vite-plugin-svgr/client" />

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png';

declare module '*.pdf';

type TelegramWebApp = {
  initData?: string;
  shareToContact?: (message: string) => void;
  openTelegramLink?: (url: string) => void;
};

type TelegramGlobal = {
  WebApp?: TelegramWebApp;
};

declare global {
  interface Window {
    Telegram?: TelegramGlobal;
  }
}

export {};
