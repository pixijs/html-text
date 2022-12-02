import { Sprite } from '@pixi/sprite';
import { Texture, Rectangle, settings, utils, ICanvas, ICanvasRenderingContext2D } from '@pixi/core';
import { TextStyle } from '@pixi/text';
import { HTMLTextStyle } from './HTMLTextStyle';

import type { ITextStyle } from '@pixi/text';
import type { Renderer, IRenderer } from '@pixi/core';
import type { IDestroyOptions } from '@pixi/display';

/**
 * Text display object that support multi-style HTML text.
 * @class
 * @extends PIXI.Sprite
 * @see {@link https://pixijs.download/dev/docs/PIXI.Sprite.html PIXI.Sprite}
 * @see {@link https://pixijs.download/dev/docs/PIXI.TextStyle.html PIXI.TextStyle}
 */
export class HTMLText extends Sprite
{
    /** Default resolution, make sure autoResolution or defaultAutoResolution is `false`. */
    public static defaultResolution: number | undefined;

    /** Default autoResolution for all HTMLText objects */
    public static defaultAutoResolution = true;

    private _domElement: HTMLElement;
    private _styleElement: HTMLElement;
    private _svgRoot: SVGSVGElement;
    private _foreignObject: SVGForeignObjectElement;
    private _image: HTMLImageElement;
    private canvas: ICanvas;
    private context: ICanvasRenderingContext2D;
    private _resolution: number;
    private _text: string | null = null;
    private _style: HTMLTextStyle | null = null;
    private _autoResolution = true;
    private _loading = false;
    private _shadow: HTMLElement;
    private _shadowRoot: ShadowRoot;
    private localStyleID = -1;
    private dirty = false;

    /** The HTMLTextStyle object is owned by this instance */
    private ownsStyle = false;

    /**
     * @param {string} [text] - Text contents
     * @param {HTMLTextStyle|PIXI.TextStyle|PIXI.ITextStyle} [style] - Style setting to use.
     *        Strongly recommend using an HTMLTextStyle object. Providing a PIXI.TextStyle
     *        will convert the TextStyle to an HTMLTextStyle and will no longer be linked.
     * @param {HTMLCanvasElement} [canvas] - Optional canvas to use for rendering.
     *.       if undefined, will generate it's own canvas using createElement.
     */
    constructor(text = '', style: HTMLTextStyle | TextStyle | Partial<ITextStyle> = {}, canvas?: ICanvas)
    {
        canvas = canvas || settings.ADAPTER.createCanvas(3, 3);

        canvas.width = 3;
        canvas.height = 3;

        const texture = Texture.from(canvas, { scaleMode: settings.SCALE_MODE });

        texture.orig = new Rectangle();
        texture.trim = new Rectangle();

        super(texture);

        const ns = 'http://www.w3.org/2000/svg';
        const svgRoot = document.createElementNS(ns, 'svg');
        const foreignObject = document.createElementNS(ns, 'foreignObject');
        const domElement = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
        const styleElement = document.createElementNS('http://www.w3.org/1999/xhtml', 'style');

        foreignObject.setAttribute('height', '100%');
        foreignObject.setAttribute('width', '100%');
        svgRoot.appendChild(foreignObject);
        svgRoot.style.paintOrder = 'stroke fill';

        this._shadow = document.createElement('div');
        this._shadow.dataset.pixiId = 'text-html-shadow';
        this._shadowRoot = this._shadow.attachShadow({ mode: 'open' });
        this._domElement = domElement;
        this._styleElement = styleElement;
        this._svgRoot = svgRoot;
        this._foreignObject = foreignObject;
        this._image = new Image();
        this._autoResolution = HTMLText.defaultAutoResolution;

        document.body.appendChild(this._shadow);

        this.canvas = canvas;
        this.context = canvas.getContext('2d') as ICanvasRenderingContext2D;
        this._resolution = HTMLText.defaultResolution ?? settings.RESOLUTION;
        this.text = text;
        this.style = style;
    }

    /**
     * Manually refresh the text.
     * @public
     * @param {boolean} respectDirty - Whether to abort updating the
     *        text if the Text isn't dirty and the function is called.
     */
    updateText(respectDirty = true): void
    {
        const { style, resolution, canvas, context } = this;

        // check if style has changed..
        if (this.localStyleID !== style.styleID)
        {
            this.dirty = true;
            this.localStyleID = style.styleID;
        }

        if (!this.dirty && respectDirty)
        {
            return;
        }

        const dom = this._domElement;
        const globalStyles = this._styleElement;

        Object.assign(dom, {
            innerHTML: this._text,
            style: style.toCSS(resolution),
        });
        globalStyles.innerHTML = style.toGlobalCSS();

        // Measure the contents using the shadow DOM
        // we do this for CSS isolation
        this._shadowRoot.appendChild(dom);
        this._shadowRoot.appendChild(globalStyles);
        const { width: _width, height: _height } = dom.getBoundingClientRect();
        const width = Math.ceil(_width);
        const height = Math.ceil(_height);

        // Assemble the svg output
        this._foreignObject.appendChild(dom);
        this._foreignObject.appendChild(globalStyles);

        // console.log('getBBox', this._svgRoot.getBBox());
        this._svgRoot.setAttribute('width', width.toString());
        this._svgRoot.setAttribute('height', height.toString());

        canvas.width = Math.ceil((Math.max(1, width) + (style.padding * 2)));
        canvas.height = Math.ceil((Math.max(1, height) + (style.padding * 2)));

        if (!this._loading)
        {
            const image = this._image;
            const svgURL = new XMLSerializer().serializeToString(this._svgRoot);

            this._loading = true;
            image.src = `data:image/svg+xml;charset=utf8,${encodeURIComponent(svgURL)}`;
            image.onload = () =>
            {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(
                    image,
                    0, 0, width, height,
                    0, 0, width, height,
                );
                image.src = '';
                image.onload = null;
                this._loading = false;
                this.updateTexture();
            };
        }
    }

    /**
     * Update the texture resource.
     * @private
     */
    updateTexture()
    {
        const { style, texture, resolution } = this;

        const canvas = this.canvas as HTMLCanvasElement;
        const context = this.context as CanvasRenderingContext2D;

        if (style.trim)
        {
            const { width, height, data } = utils.trimCanvas(canvas);

            if (data)
            {
                canvas.width = width;
                canvas.height = height;
                context.putImageData(data, 0, 0);
            }
        }

        const padding = style.trim ? 0 : style.padding;
        const baseTexture = texture.baseTexture;

        texture.trim.width = texture._frame.width = canvas.width / resolution;
        texture.trim.height = texture._frame.height = canvas.height / resolution;
        texture.trim.x = -padding;
        texture.trim.y = -padding;

        texture.orig.width = texture._frame.width - (padding * 2);
        texture.orig.height = texture._frame.height - (padding * 2);

        // call sprite onTextureUpdate to update scale if _width or _height were set
        this._onTextureUpdate();

        baseTexture.setRealSize(canvas.width, canvas.height, resolution);

        this.dirty = false;
    }

    /**
     * Renders the object using the WebGL renderer
     *
     * @param {PIXI.Renderer} renderer - The renderer
     * @private
     */
    _render(renderer: Renderer)
    {
        if (this._autoResolution && this._resolution !== renderer.resolution)
        {
            this._resolution = renderer.resolution;
            this.dirty = true;
        }

        this.updateText(true);

        super._render(renderer);
    }

    /**
     * Renders the object using the Canvas Renderer.
     *
     * @private
     * @param {PIXI.CanvasRenderer} renderer - The renderer
     */
    _renderCanvas(renderer: IRenderer)
    {
        if (this._autoResolution && this._resolution !== renderer.resolution)
        {
            this._resolution = renderer.resolution;
            this.dirty = true;
        }

        this.updateText(true);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        super._renderCanvas(renderer);
    }

    /**
     * Get the local bounds.
     *
     * @param {PIXI.Rectangle} rect - Input rectangle.
     * @return {PIXI.Rectangle} Local bounds
     */
    getLocalBounds(rect: Rectangle)
    {
        this.updateText(true);

        return super.getLocalBounds(rect);
    }

    _calculateBounds()
    {
        this.updateText(true);
        this.calculateVertices();
        // if we have already done this on THIS frame.
        (this as any)._bounds.addQuad(this.vertexData);
    }

    /**
     * Handle dirty style changes
     * @private
     */
    _onStyleChange()
    {
        this.dirty = true;
    }

    /**
     * Destroy this Text object. Don't use after calling.
     * @param {boolean|object} options - Same as Sprite destroy options.
     */
    destroy(options?: boolean | IDestroyOptions | undefined)
    {
        super.destroy(options);

        const forceClear: any = null;

        // make sure to reset the the context and canvas..
        // dont want this hanging around in memory!
        this.context = null as any;
        if (this.canvas)
        {
            this.canvas.width = this.canvas.height = 0; // Safari hack
        }
        // Remove any loaded fonts if we created the HTMLTextStyle
        if (this.ownsStyle)
        {
            this._style?.cleanFonts();
        }
        this.canvas = forceClear;
        this._style = forceClear;
        this._svgRoot = forceClear;
        this._domElement = forceClear;
        this._foreignObject = forceClear;
        this._styleElement = forceClear;
        this._image.onload = null;
        this._image.src = '';
        this._image = forceClear;
        this._shadow = forceClear;
        this._shadowRoot = forceClear;
    }

    /**
     * Get the width in pixels.
     * @member {number}
     */
    get width()
    {
        this.updateText(true);

        return Math.abs(this.scale.x) * this.canvas.width / this.resolution;
    }

    set width(value) // eslint-disable-line require-jsdoc
    {
        this.updateText(true);

        const s = utils.sign(this.scale.x) || 1;

        this.scale.x = s * value / this.canvas.width / this.resolution;
        this._width = value;
    }

    /**
     * Get the height in pixels.
     * @member {number}
     */
    get height()
    {
        this.updateText(true);

        return Math.abs(this.scale.y) * this.canvas.height / this.resolution;
    }

    set height(value) // eslint-disable-line require-jsdoc
    {
        this.updateText(true);

        const s = utils.sign(this.scale.y) || 1;

        this.scale.y = s * value / this.canvas.height / this.resolution;
        this._height = value;
    }

    /** The base style to render with text. */
    get style(): HTMLTextStyle
    {
        return this._style as HTMLTextStyle;
    }

    set style(style: HTMLTextStyle | TextStyle | Partial<ITextStyle>) // eslint-disable-line require-jsdoc
    {
        // Don't do anything if we're re-assigning
        if (this._style === style)
        {
            return;
        }

        style = style || {};

        if (style instanceof HTMLTextStyle)
        {
            this.ownsStyle = false;
            this._style = style;
        }
        // Clone TextStyle
        else if (style instanceof TextStyle)
        {
            console.warn('[HTMLText] Cloning TextStyle, if this is not what you want, use HTMLTextStyle');

            this.ownsStyle = true;
            this._style = HTMLTextStyle.from(style);
        }
        else
        {
            this.ownsStyle = true;
            this._style = new HTMLTextStyle(style);
        }

        this.localStyleID = -1;
        this.dirty = true;
    }

    /**
     * Contents of text. This can be HTML text and include tags.
     * @example
     * const text = new HTMLText('This is a <em>styled</em> text!');
     * @member {string}
     */
    get text()
    {
        return this._text;
    }

    set text(text) // eslint-disable-line require-jsdoc
    {
        text = String(text === '' || text === null || text === undefined ? ' ' : text);
        text = this.sanitiseText(text);

        if (this._text === text)
        {
            return;
        }
        this._text = text;
        this.dirty = true;
    }

    /**
     * The resolution / device pixel ratio of the canvas.
     * This is set to automatically match the renderer resolution by default, but can be overridden by setting manually.
     * @member {number}
     * @default 1
     */
    get resolution(): number
    {
        return this._resolution;
    }

    set resolution(value: number) // eslint-disable-line require-jsdoc
    {
        this._autoResolution = false;

        if (this._resolution === value)
        {
            return;
        }

        this._resolution = value;
        this.dirty = true;
    }

    /**
     * Sanitise text - replace `<br>` with `<br/>`, `&nbsp;` with `&#160;`
     * @see https://www.sitepoint.com/community/t/xhtml-1-0-transitional-xml-parsing-error-entity-nbsp-not-defined/3392/3
     */
    private sanitiseText(text: string): string
    {
        return text
            .replace(/<br>/gi, '<br/>')
            .replace(/<hr>/gi, '<hr/>')
            .replace(/&nbsp;/gi, '&#160;');
    }
}
