import { Sprite } from '@pixi/sprite';
import { TextStyle } from '@pixi/text';

export class HTMLText extends Sprite {
    constructor(text?:string, style?:Partial<TextStyle>, canvas?:HTMLCanvasElement);
    readonly canvas:HTMLCanvasElement;
    readonly context:CanvasRenderingContext2D;
    text:string;
    style:Partial<TextStyle>;
    resolution: number;
    updateText(respectDirty?:boolean): void;
}
