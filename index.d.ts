import { Sprite } from '@pixi/sprite';
import { TextStyle } from '@pixi/text';

export class HTMLText extends Sprite {
    constructor(text?:string, style?:TextStyle, canvas?:HTMLCanvasElement);
    readonly canvas:HTMLCanvasElement;
    readonly context:CanvasRenderingContext2D;
    text:string;
    style:TextStyle;
    resolution: number;
    updateText(respectDirty?:boolean): void;
}
