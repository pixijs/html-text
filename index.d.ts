/// <reference types="pixi.js" />

declare namespace PIXI {
    export class HTMLText extends PIXI.Sprite {
        constructor(text?:string, style?:PIXI.TextStyle, canvas?:HTMLCanvasElement);
        readonly canvas:HTMLCanvasElement;
        readonly context:CanvasRenderingContext2D;
        text:string;
        style:PIXI.TextStyle;
        updateText(respectDirty?:boolean): void;
    }
}

declare module "@pixi/text-html" {
    export import HTMLText = PIXI.HTMLText;
}
