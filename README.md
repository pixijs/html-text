# PixiJS HTMLText

An alternative to `PIXI.Text`, but has some distinct advantages:

* Supports PixiJS v5+
* Works in Canvas or WebGL rendering
* Supports HTML tags for styling such as `<strong>`, or `<em>`, as well as `<span style="">`
* Better support for emojis and other HTML layout features, better compatibility with CSS line-height and letter-spacing.

Disadvantages:

* Performance is on-par with `PIXI.Text`, that is to say slow for redrawing
* Only works with browsers that support [btoa](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa), e.g., no IE 9 support

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

## Example

https://pixijs.io/pixi-html-text/demo/