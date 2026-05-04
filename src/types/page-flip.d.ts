declare module 'page-flip' {
  interface PageFlipConfig {
    width: number;
    height: number;
    size?: string;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    usePortrait?: boolean;
    drawShadow?: boolean;
    flippingTime?: number;
    startPage?: number;
  }

  class PageFlip {
    constructor(element: HTMLElement, config: PageFlipConfig);
    loadFromHTML(pages: NodeListOf<Element>): void;
    flipNext(): void;
    flipPrev(): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    on(event: string, callback: () => void): void;
    destroy?(): void;
  }

  export { PageFlip };
}
