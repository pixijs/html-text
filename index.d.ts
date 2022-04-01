import { Sprite } from '@pixi/sprite';
import { TextStyle } from '@pixi/text';

export class HTMLText extends Sprite {
    constructor(text?:string, style?:PIXI.TextStyle, canvas?:HTMLCanvasElement, cssStyle?: Record<string, Record<string, unknown>>);
    readonly canvas:HTMLCanvasElement;
    readonly context:CanvasRenderingContext2D;
    text:string;
    style:TextStyle;
    cssStyle:Record<string, Record<string, unknown>>;
    resolution: number;
    updateText(respectDirty?:boolean): void;
}
