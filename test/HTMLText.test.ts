import { HTMLText } from '../src/HTMLText';

describe('HTMLText', () =>
{
    it('should create an HTMLText element', () =>
    {
        const text = new HTMLText('Hello World');

        expect(text).toBeTruthy();
        expect(text.text).toBe('Hello World');

        text.destroy();
    });

    it('should clean up the shadow element', () =>
    {
        const query = '[data-pixi-html-text]';

        expect(document.querySelector(query)).toBeFalsy();

        const text = new HTMLText('Hello world!');

        expect(document.querySelector(query)).toBeTruthy();

        text.destroy();

        expect(document.querySelector(query)).toBeFalsy();
    });

    it('should clean up the shadow element multiples', () =>
    {
        const query = '[data-pixi-html-text]';

        expect(document.querySelector(query)).toBeFalsy();

        const text = new HTMLText('Hello world!');
        const text2 = new HTMLText('Hello world2!');

        expect(document.querySelector(query)).toBeTruthy();

        text.destroy();
        text2.destroy();

        expect(document.querySelector(query)).toBeFalsy();
    });
});
