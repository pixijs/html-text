# PixiJS HTMLText

An alternative to `PIXI.Text` that works with PixiJS v5 (both WebGL and Canvas), however, it has some advantages:

* Supports HTML tags for styling such as `<strong>`, or `<em>`, as well as `<span style="">`
* Better support for emojis and other HTML layout features, better compatibility with CSS line-height and letter-spacing.

Disadvantages:

* Unlike `PIXI.Text`, HTMLText rendering will vary slightly between platforms and browsers. HTMLText uses SVG/DOM to render text and not Context2D's fillText like `PIXI.Text`.
* Performance and memory usage is on-par with `PIXI.Text` (that is to say, slow and heavy)
* Only works with browsers that support [`btoa`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa) and [`<foreignObject>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject), i.e., no Internet Explorer support

## Install

```bash
npm install @pixi/text-html
```

```bash
yarn add @pixi/text-html
```

## Usage

```js
import { HTMLText } from '@pixi/text-html';
import { TextStyle } from '@pixi/text';

// Can use the TextStyle class found in @pixi/text
const style = new TextStyle({ fontSize: 20 });

// Make a new HTMLText object
const text = new HTMLText("Hello World", style);
```

## Styles

Not all styles and values are compatible between PIXI.Text, mainly because Text is rendered using a DOM element instead of Context2D's fillText API.

**Supported**

* `fill`
* `fontFamily`
* `fontSize`
* `fontWeight`
* `fontStyle`
* `fontVariant`
* `letterSpacing` †
* `align` (also supports "justify")
* `padding`
* `breakWords`
* `lineHeight` †
* `wordWrap`
* `wordWrapWidth`
* `strokeThickness` ‡
* `dropShadow` ‡
* `dropShadowAngle`
* `dropShadowDistance`
* `dropShadowBlur` ‡
* `dropShadowColor`
* `trim`
* `stroke`
* `strokeThickness`

† _Values may differ slightly from PIXI.Text rendering._
‡ _Appearance may differ slightly between different browsers._

**Unsupported**

* `fillGradientStops`
* `fillGradientType`
* `miterLimit`
* `textBaseline`
* `whiteSpace`

## Example

https://pixijs.io/pixi-html-text/demo/