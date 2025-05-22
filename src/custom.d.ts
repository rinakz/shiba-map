/// <reference types="vite-plugin-svgr/client" />

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png';

declare module '*.pdf';

// declare interface Window {
//   hasUnsavedChanges: boolean;
//   isReadOnly: boolean;
// }
