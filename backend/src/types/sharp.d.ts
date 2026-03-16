declare module 'sharp' {
  function sharp(
    input?: Buffer | string
  ): {
    rotate: (angle?: number) => any;
    resize: (width?: number, height?: number, options?: any) => any;
    jpeg: (options?: any) => any;
    png: (options?: any) => any;
    webp: (options?: any) => any;
    toBuffer: () => Promise<Buffer>;
    [key: string]: any;
  };

  export = sharp;
}
