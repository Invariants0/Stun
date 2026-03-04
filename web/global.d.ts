// Global type declarations for CSS imports
declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "reactflow/dist/style.css";
declare module "tldraw/tldraw.css";
