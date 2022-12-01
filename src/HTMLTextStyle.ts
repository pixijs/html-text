import { settings, utils } from '@pixi/core';
import { TextStyle, TextStyleFontStyle, TextStyleFontWeight } from '@pixi/text';

import type { ITextStyle, TextStyleTextBaseline } from '@pixi/text';

// HTMLText support more white-space options
type HTMLTextStyleWhiteSpace = 'normal' | 'pre' | 'pre-line' | 'nowrap' | 'pre-wrap';

// Subset of ITextStyle
type ITextStyleIgnore = 'whiteSpace' | 'fillGradientStops' | 'fillGradientType' | 'miterLimit' | 'textBaseline';
interface IHTMLTextStyle extends Omit<ITextStyle, ITextStyleIgnore>
{
    whiteSpace: HTMLTextStyleWhiteSpace;
}

interface IHTMLFont
{
    url: string;
    family: string;
    weight: TextStyleFontWeight;
    style: TextStyleFontStyle;
}

/**
 * Used internally to restrict text style usage and convert easily to CSS.
 * @class
 * @extends PIXI.TextStyle
 * @see {@link https://pixijs.download/dev/docs/PIXI.TextStyle.html PIXI.TextStyle}
 */
class HTMLTextStyle extends TextStyle
{
    public static readonly defaultOptions: IHTMLTextStyle = {
        align: 'left',
        breakWords: false,
        dropShadow: false,
        dropShadowAlpha: 1,
        dropShadowAngle: Math.PI / 6,
        dropShadowBlur: 0,
        dropShadowColor: 'black',
        dropShadowDistance: 5,
        fill: 'black',
        fontFamily: 'Arial',
        fontSize: 26,
        fontStyle: 'normal',
        fontVariant: 'normal',
        fontWeight: 'normal',
        letterSpacing: 0,
        lineHeight: 0,
        lineJoin: 'miter',
        padding: 0,
        stroke: 'black',
        strokeThickness: 0,
        trim: false,
        whiteSpace: 'normal',
        wordWrap: false,
        wordWrapWidth: 100,
        leading: 0,
    };

    /** For using custom fonts */
    private _fonts: IHTMLFont[] = [];

    /** List of internal style rules */
    private _overrides: string[] = [];

    /** Global rules or stylesheet, useful for creating rules for rendering */
    public globalCSS = '';

    /**
     * Convert a TextStyle to HTMLTextStyle
     * @example
     * import {TextStyle } from 'pixi.js';
     * import {HTMLTextStyle} from '@pixi/text-html';
     * const style = new TextStyle();
     * const htmlStyle = HTMLTextStyle.from(style);
     */
    static from(originalStyle: TextStyle | Partial<IHTMLTextStyle>): HTMLTextStyle
    {
        return new HTMLTextStyle(Object.keys(HTMLTextStyle.defaultOptions)
            .reduce((obj, prop) => ({ ...obj, [prop]: originalStyle[prop as keyof IHTMLTextStyle] }), {})
        );
    }

    /** Clear the current font */
    public cleanFonts(): void
    {
        if (this._fonts.length > 0)
        {
            this.fontFamily = 'Arial';
            this._fonts.length = 0;
            this.styleID++;
        }
    }

    /** Because of how HTMLText renders, fonts need to be imported */
    public loadFont(url: string, options: Partial<Omit<IHTMLFont, 'url'>> = {}): Promise<IHTMLFont>
    {
        return settings.ADAPTER.fetch(url)
            .then((response) => response.blob())
            .then((blob) => new Promise<string>((resolve, reject) =>
            {
                const reader = new FileReader();

                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            }))
            .then((url) =>
            {
                const font = Object.assign({}, {
                    family: utils.path.basename(url, utils.path.extname(url)),
                    weight: 'normal',
                    style: 'normal',
                }, { url }, options) as IHTMLFont;

                this._fonts.push(font);
                this.styleID++;

                return font;
            });
    }

    /**
     * Add a style override, this can be any CSS property
     * it will override any built-in style. This is the
     * property and the value as a string (e.g., `color: red`).
     * This will override any other internal style.
     * @param {string} value - CSS style(s) to add.
     * @example
     * style.addOverride('background-color: red');
     */
    public addOverride(...value: string[]): void
    {
        const toAdd = value.filter((v) => !this._overrides.includes(v));

        if (toAdd.length > 0)
        {
            this._overrides.push(...toAdd);
            this.styleID++;
        }
    }

    /**
     * Remove any overrides that match the value.
     * @param {string} value - CSS style to remove.
     * @example
     * style.removeOverride('background-color: red');
     */
    public removeOverride(...value: string[]): void
    {
        const toRemove = value.filter((v) => this._overrides.includes(v));

        if (toRemove.length > 0)
        {
            this._overrides = this._overrides.filter((v) => !toRemove.includes(v));
            this.styleID++;
        }
    }

    /**
     * Internally converts all of the style properties into CSS equivalents.
     * @return The CSS style string, for setting `style` property of root HTMLElement.
     */
    public toCSS(scale: number): string
    {
        return [
            'display: inline-block',
            `color: ${this.normalizeColor(this.fill)}`,
            `font-size: ${(this.fontSize as number) * scale}px`,
            `font-family: ${this.fontFamily}`,
            `font-weight: ${this.fontWeight}`,
            `font-style: ${this.fontStyle}`,
            `font-variant: ${this.fontVariant}`,
            `letter-spacing: ${this.letterSpacing * scale}px`,
            `text-align: ${this.align}`,
            `padding: ${this.padding * scale}px`,
            `white-space: ${this.whiteSpace}`,
            ...this.lineHeight ? [`line-height: ${this.lineHeight * scale}px`] : [],
            ...this.wordWrap ? [
                `word-wrap: ${this.breakWords ? 'break-all' : 'break-word'}`,
                `max-width: ${this.wordWrapWidth * scale}px`
            ] : [],
            ...this.strokeThickness ? [
                `-webkit-text-stroke-width: ${this.strokeThickness * scale}px`,
                `-webkit-text-stroke-color: ${this.normalizeColor(this.stroke)}`,
                `text-stroke-width: ${this.strokeThickness * scale}px`,
                `text-stroke-color: ${this.normalizeColor(this.stroke)}`,
                'paint-order: stroke',
            ] : [],
            ...this.dropShadow ? [this.dropShadowToCSS(scale)] : [],
            ...this._overrides,
        ].join(';');
    }

    /** Get the font CSS styles from the loaded font, If available. */
    public toGlobalCSS(): string
    {
        return this._fonts.reduce((result, font) => (
            `${result}
            @font-face {
                font-family: "${font.family}";
                src: url('${font.url}');
                font-weight: ${font.weight};
                font-style: ${font.style}; 
            }`
        ), this.globalCSS);
    }

    /** Convert numerical colors into hex-strings */
    private normalizeColor(color: any): string
    {
        if (Array.isArray(color))
        {
            color = utils.rgb2hex(color);
        }

        if (typeof color === 'number')
        {
            return utils.hex2string(color);
        }

        return color;
    }

    /** Convert the internal drop-shadow settings to CSS text-shadow */
    private dropShadowToCSS(scale: number): string
    {
        let color = this.normalizeColor(this.dropShadowColor);
        const alpha = this.dropShadowAlpha;
        const x = Math.round(Math.cos(this.dropShadowAngle) * this.dropShadowDistance);
        let y = Math.round(Math.sin(this.dropShadowAngle) * this.dropShadowDistance);

        // Append alpha to color
        if (color.startsWith('#') && alpha < 1)
        {
            color += (alpha * 255 | 0).toString(16).padStart(2, '0');
        }

        const { userAgent } = settings.ADAPTER.getNavigator();

        // Shadow is flipped on Safari
        if ((/^((?!chrome|android).)*safari/i).test(userAgent))
        {
            y *= -1;
        }

        const position = `${x * scale}px ${y * scale}px`;

        if (this.dropShadowBlur > 0)
        {
            return `text-shadow: ${position} ${this.dropShadowBlur}px ${color}`;
        }

        return `text-shadow: ${position} ${color}`;
    }

    /** Resets all properties to the defaults specified in TextStyle.prototype._default */
    public reset(): void
    {
        Object.assign(this, HTMLTextStyle.defaultOptions);
    }

    /** @ignore fillGradientStops is not supported by HTMLText */
    override set fillGradientStops(_value: number[])
    {
        console.warn('[HTMLTextStyle] fillGradientStops is not supported by HTMLText');
    }
    override get fillGradientStops()
    {
        return super.fillGradientStops;
    }

    /** @ignore fillGradientType is not supported by HTMLText */
    override set fillGradientType(_value: number)
    {
        console.warn('[HTMLTextStyle] fillGradientType is not supported by HTMLText');
    }
    override get fillGradientType()
    {
        return super.fillGradientType;
    }

    /** @ignore miterLimit is not supported by HTMLText */
    override set miterLimit(_value: number)
    {
        console.warn('[HTMLTextStyle] miterLimit is not supported by HTMLText');
    }
    override get miterLimit()
    {
        return super.miterLimit;
    }

    /** @ignore textBaseline is not supported by HTMLText */
    override set textBaseline(_value: TextStyleTextBaseline)
    {
        console.warn('[HTMLTextStyle] textBaseline is not supported by HTMLText');
    }
    override get textBaseline()
    {
        return super.textBaseline;
    }
}

export { HTMLTextStyle };
export type { IHTMLTextStyle, HTMLTextStyleWhiteSpace };
