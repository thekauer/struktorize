import { AbstractText } from './ast';
import { parseSignatureText, parseIdsText } from './parser';

describe('parser', () => {
  describe('text', () => {
    describe('parseIdsText', () => {
      it('should return empty for empty text', () => {
        const input = [] as AbstractText;
        const result = parseIdsText(input);
        expect(result).toEqual([]);
      });

      it('should return empty for numbers', () => {
        const input = [
          { type: 'char', value: '1' },
          { type: 'char', value: '2' },
          { type: 'space' },
          { type: 'char', value: '3' },
        ] as AbstractText;
        const result = parseIdsText(input);
        expect(result).toEqual([]);
      });

      it('should return ids', () => {
        const input = [
          { type: 'char', value: 'b' },
          { type: 'char', value: '2' },
          { type: 'space' },
          { type: 'char', value: 'a' },
          { type: 'space' },
          { type: 'char', value: '2' },
          { type: 'char', value: 'a' },
        ] as AbstractText;
        const result = parseIdsText(input);
        expect(result.map((r) => r.name)).toEqual(['b2', 'a']);
      });
    });

    describe('parseSignatureText', () => {
      it('should return empty for empty text', () => {
        const input = [] as AbstractText;
        const result = parseSignatureText(input);
        expect(result).toEqual(null);
      });

      it('should return null for just a variable', () => {
        const input = [
          { type: 'char', value: 'b' },
          { type: 'char', value: '2' },
        ] as AbstractText;
        const result = parseSignatureText(input);
        expect(result).toEqual(null);
      });

      it('should return name for just a function with no args', () => {
        const input = [
          { type: 'char', value: 'b' },
          { type: 'char', value: '2' },
          { type: 'lp' },
          { type: 'rp' },
        ] as AbstractText;
        const result = parseSignatureText(input);
        expect(result).toEqual({
          _type: 'signature',
          name: 'b2',
          args: [],
          returnType: null,
          type: '() → any',
        });
      });

      it('should return name and returnType for a function with no args and a return type', () => {
        const input = [
          { type: 'char', value: 'b' },
          { type: 'char', value: '2' },
          { type: 'lp' },
          { type: 'rp' },
          { type: 'space' },
          { type: 'colon' },
          { type: 'char', value: 'R' },
          { type: 'char', value: 'T' },
        ] as AbstractText;
        const result = parseSignatureText(input);
        expect(result).toEqual({
          _type: 'signature',
          name: 'b2',
          args: [],
          returnType: 'RT',
          type: '() → RT',
        });
      });

      it('should return name and returnType for a function with no args and a return type using in in return type', () => {
        const input = [
          { type: 'char', value: 'b' },
          { type: 'char', value: '2' },
          { type: 'lp' },
          { type: 'rp' },
          { type: 'space' },
          { type: 'in' },
          { type: 'char', value: 'R' },
          { type: 'char', value: 'T' },
        ] as AbstractText;
        const result = parseSignatureText(input);
        expect(result).toEqual({
          _type: 'signature',
          name: 'b2',
          args: [],
          returnType: 'RT',
          type: '() → RT',
        });
      });

      it('should return name and one arg for a function with a single arg and no return type', () => {
        const input = [
          { type: 'space' },
          { type: 'char', value: 'f' },
          { type: 'char', value: 'u' },
          { type: 'char', value: 'n' },
          { type: 'lp' },
          { type: 'space' },
          { type: 'char', value: 'a' },
          { type: 'char', value: 'r' },
          { type: 'char', value: 'g' },
          { type: 'char', value: '1' },
          { type: 'space' },
          { type: 'in' },
          { type: 'space' },
          { type: 'char', value: 'A' },
          { type: 'char', value: 'T' },
          { type: 'char', value: '1' },
          { type: 'rp' },
        ] as AbstractText;
        const result = parseSignatureText(input);
        expect(result).toEqual({
          _type: 'signature',
          name: 'fun',
          args: [{ _type: 'arg', name: 'arg1', typeId: 'AT1' }],
          returnType: null,
          type: 'AT1 → any',
        });
      });

      it('should return name and two args for a function with two args and no return type', () => {
        const input = [
          { type: 'space' },
          { type: 'char', value: 'f' },
          { type: 'char', value: 'u' },
          { type: 'char', value: 'n' },
          { type: 'lp' },
          { type: 'space' },
          { type: 'char', value: 'a' },
          { type: 'char', value: 'r' },
          { type: 'char', value: 'g' },
          { type: 'char', value: '1' },
          { type: 'space' },
          { type: 'in' },
          { type: 'space' },
          { type: 'char', value: 'A' },
          { type: 'char', value: 'T' },
          { type: 'char', value: '1' },
          { type: 'comma' },
          { type: 'char', value: 'a' },
          { type: 'char', value: 'r' },
          { type: 'char', value: 'g' },
          { type: 'char', value: '2' },
          { type: 'space' },
          { type: 'in' },
          { type: 'space' },
          { type: 'char', value: 'A' },
          { type: 'char', value: 'T' },
          { type: 'char', value: '2' },
          { type: 'rp' },
        ] as AbstractText;
        const result = parseSignatureText(input);
        expect(result).toEqual({
          _type: 'signature',
          name: 'fun',
          args: [
            { _type: 'arg', name: 'arg1', typeId: 'AT1' },
            { _type: 'arg', name: 'arg2', typeId: 'AT2' },
          ],
          returnType: null,
          type: 'AT1×AT2 → any',
        });
      });

      it('should return name and two args for a function with two args and no return type and trailing comma', () => {
        const input = [
          { type: 'space' },
          { type: 'char', value: 'f' },
          { type: 'char', value: 'u' },
          { type: 'char', value: 'n' },
          { type: 'lp' },
          { type: 'space' },
          { type: 'char', value: 'a' },
          { type: 'char', value: 'r' },
          { type: 'char', value: 'g' },
          { type: 'char', value: '1' },
          { type: 'space' },
          { type: 'in' },
          { type: 'space' },
          { type: 'char', value: 'A' },
          { type: 'char', value: 'T' },
          { type: 'char', value: '1' },
          { type: 'comma' },
          { type: 'char', value: 'a' },
          { type: 'char', value: 'r' },
          { type: 'char', value: 'g' },
          { type: 'char', value: '2' },
          { type: 'space' },
          { type: 'in' },
          { type: 'space' },
          { type: 'char', value: 'A' },
          { type: 'char', value: 'T' },
          { type: 'char', value: '2' },
          { type: 'comma' },
          { type: 'rp' },
        ] as AbstractText;
        const result = parseSignatureText(input);
        expect(result).toEqual({
          _type: 'signature',
          name: 'fun',
          args: [
            { _type: 'arg', name: 'arg1', typeId: 'AT1' },
            { _type: 'arg', name: 'arg2', typeId: 'AT2' },
          ],
          returnType: null,
          type: 'AT1×AT2 → any',
        });
      });

      it('should return name and two args for a function with two args without types and no return type', () => {
        const input = [
          { type: 'space' },
          { type: 'char', value: 'f' },
          { type: 'char', value: 'u' },
          { type: 'char', value: 'n' },
          { type: 'lp' },
          { type: 'space' },
          { type: 'char', value: 'a' },
          { type: 'char', value: 'r' },
          { type: 'char', value: 'g' },
          { type: 'char', value: '1' },
          { type: 'space' },
          { type: 'comma' },
          { type: 'char', value: 'a' },
          { type: 'char', value: 'r' },
          { type: 'char', value: 'g' },
          { type: 'char', value: '2' },
          { type: 'space' },
          { type: 'rp' },
        ] as AbstractText;
        const result = parseSignatureText(input);
        expect(result).toEqual({
          _type: 'signature',
          name: 'fun',
          args: [
            { _type: 'arg', name: 'arg1', typeId: null },
            { _type: 'arg', name: 'arg2', typeId: null },
          ],
          returnType: null,
          type: 'any×any → any',
        });
      });

      it('should return name and two args and a returnType for a function with two args and return type', () => {
        const input = [
          { type: 'space' },
          { type: 'char', value: 'f' },
          { type: 'char', value: 'u' },
          { type: 'char', value: 'n' },
          { type: 'lp' },
          { type: 'space' },
          { type: 'char', value: 'a' },
          { type: 'char', value: 'r' },
          { type: 'char', value: 'g' },
          { type: 'char', value: '1' },
          { type: 'space' },
          { type: 'in' },
          { type: 'space' },
          { type: 'char', value: 'A' },
          { type: 'char', value: 'T' },
          { type: 'char', value: '1' },
          { type: 'comma' },
          { type: 'char', value: 'a' },
          { type: 'char', value: 'r' },
          { type: 'char', value: 'g' },
          { type: 'char', value: '2' },
          { type: 'space' },
          { type: 'in' },
          { type: 'space' },
          { type: 'char', value: 'A' },
          { type: 'char', value: 'T' },
          { type: 'char', value: '2' },
          { type: 'rp' },
          { type: 'space' },
          { type: 'in' },
          { type: 'space' },
          { type: 'char', value: 'R' },
          { type: 'char', value: 'T' },
        ] as AbstractText;
        const result = parseSignatureText(input);
        expect(result).toEqual({
          _type: 'signature',
          name: 'fun',
          args: [
            { _type: 'arg', name: 'arg1', typeId: 'AT1' },
            { _type: 'arg', name: 'arg2', typeId: 'AT2' },
          ],
          returnType: 'RT',
          type: 'AT1×AT2 → RT',
        });
      });
    });
  });
});
