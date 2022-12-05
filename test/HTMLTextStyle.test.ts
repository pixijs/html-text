import { HTMLTextStyle } from '../src/HTMLTextStyle';
import { TextStyle } from '@pixi/text';

describe('HTMLTextStyle', () => {
    it('should create an instance', () => {
        expect(new HTMLTextStyle()).toBeTruthy();
    });

    describe('constructor', () => {
        it('should set properties from constructor', () => {
            const style = new HTMLTextStyle({
                fontFamily: 'Times',
                fontSize: 12,
            });
            expect(style.fontFamily).toBe('Times');
            expect(style.fontSize).toBe(12);
        });
    });

    describe('from', () => {
        it('should import from TextStyle', () => {
            expect(HTMLTextStyle.from(new TextStyle())).toBeTruthy();
        })
    });

    describe('addOverride', () => {
        it('should add override', () => {
            const style = new HTMLTextStyle();
            const id = style.styleID;
            style.addOverride('color: red');
            expect(style.styleID).toBe(id + 1);
        });

        it('should add override once', () => {
            const style = new HTMLTextStyle();
            const id = style.styleID;
            style.addOverride('color: red');
            style.addOverride('color: red');
            expect(style.styleID).toBe(id + 1);
        });

        it('should remove override', () => {
            const style = new HTMLTextStyle();
            const id = style.styleID;
            style.addOverride('color: red');
            style.removeOverride('color: red');
            expect(style.styleID).toBe(id + 2);
        });

        it('should remove override once', () => {
            const style = new HTMLTextStyle();
            const id = style.styleID;
            style.addOverride('color: red');
            style.removeOverride('color: red');
            style.removeOverride('color: red');
            expect(style.styleID).toBe(id + 2);
        });
    });

    describe('toCSS', () => {
        it('should converto CSS', () => {
            const style = new HTMLTextStyle();
            expect(style.toCSS(1)).toMatchSnapshot();
        });

        it('should insert overrides', () => {
            const style = new HTMLTextStyle();
            style.addOverride('color: red');
            expect(style.toCSS(1)).toMatchSnapshot();
        });
    });

    describe('toGlobalCSS', () => {
        it('should converto CSS', () => {
            const style = new HTMLTextStyle();
            expect(style.toGlobalCSS()).toMatchSnapshot();
        });

        it('should converto CSS', () => {
            const style = new HTMLTextStyle();
            style.globalCSS = `p { color: red; }`
            expect(style.toGlobalCSS()).toMatchSnapshot();
        });
    });
});