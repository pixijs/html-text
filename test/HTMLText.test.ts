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

    describe('measureText', () =>
    {
        it('should measure empty text to be drawable', () =>
        {
            const text = new HTMLText();
            const size = text.measureText('');

            expect(size).toBeTruthy();
            expect(size.width).toBe(0);
            expect(size.height).toBe(0);

            text.destroy();
        });

        it('should measure text', () =>
        {
            const text = new HTMLText();
            const size = text.measureText('Hello world!');

            expect(size).toBeTruthy();
            expect(size.width).toBeGreaterThan(0);
            expect(size.height).toBeGreaterThan(0);

            text.destroy();
        });
    });
});
