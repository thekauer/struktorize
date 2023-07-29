import exp from 'constants';
import { deleteLast, getFunctionName } from './abstractText';
import { AbstractText } from './ast';

describe('AbstractText', () => {
  describe('getFunctionName', () => {
    it("should return the function name 'main'", () => {
      const text: AbstractText = [
        { type: 'variable', name: 'main' },
        { type: 'lp' },
        { type: 'variable', name: 'a' },
        { type: 'in' },
        { type: 'mathbb', value: 'N' },
        { type: 'rp' },
      ];

      const result = getFunctionName(text);

      expect(result).toBe('main');
    });
    it("should return the function name 'foo'", () => {
      const text: AbstractText = [
        { type: 'variable', name: 'foo' },
        { type: 'lp' },
        { type: 'variable', name: 'a' },
        { type: 'in' },
        { type: 'mathbb', value: 'N' },
        { type: 'rp' },
      ];

      const result = getFunctionName(text);

      expect(result).toBe('foo');
    });
    it('should return empty string when the first AbstractChar is not of type variable', () => {
      const text: AbstractText = [
        { type: 'lp' },
        { type: 'variable', name: 'a' },
        { type: 'in' },
        { type: 'mathbb', value: 'N' },
        { type: 'rp' },
      ];

      const result = getFunctionName(text);

      expect(result).toBe('');
    });
  });
  describe('deleteLast', () => {
    it('should do nothing when the AbstractText is empty', () => {
      const result = deleteLast([]);
      expect(result).toEqual([]);
    });
  });
});
