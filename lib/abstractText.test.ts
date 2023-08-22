import { Cursor, deleteLast, getFunctionName, strlen } from './abstractText';
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

  describe('strlen', () => {
    it('should be 0 for empty text', () => {
      const text: AbstractText = [];
      const result = strlen(text);
      expect(result).toBe(0);
    });

    it('should be 2 for text with 1 variable', () => {
      const text: AbstractText = [{ type: 'variable', name: 'a' }];
      const result = strlen(text);
      expect(result).toBe(2);
    });

    it('should be 3 for text with 2 variables', () => {
      const text: AbstractText = [
        { type: 'variable', name: 'a' },
        { type: 'variable', name: 'b' },
      ];
      const result = strlen(text);
      expect(result).toBe(3);
    });

    it('should be 3 for text with 1 variable and 1 space', () => {
      const text: AbstractText = [
        { type: 'variable', name: 'a' },
        { type: 'space' },
      ];
      const result = strlen(text);
      expect(result).toBe(3);
    });

    it('should be 3 for text with 1 variable and 1 subscript', () => {
      const text: AbstractText = [
        { type: 'variable', name: 'a' },
        { type: 'subscript', text: [] },
      ];
      const result = strlen(text);
      expect(result).toBe(3);
    });
  });

  describe('cursor', () => {
    describe('right', () => {
      it('should not go right in empty text', () => {
        const text = [] as AbstractText;
        const cursor = 0;

        const result = Cursor.right(text, cursor);

        expect(result.cursor).toBe(0);
      });

      it('should go right once', () => {
        const text = [{ type: 'variable', name: 'a' }] as AbstractText;
        const cursor = 0;

        const result = Cursor.right(text, cursor);

        expect(result.cursor).toBe(1);
      });

      it('should not go right when the cursor is at the end of the text', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 2;

        const result = Cursor.right(text, cursor);

        expect(result.cursor).toBe(2);
      });

      it('should skip subscript when going right', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'subscript', text: [] },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.right(text, cursor);

        expect(result.cursor).toBe(2);
      });

      it('should skip superscript when going right', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'superscript', text: [] },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.right(text, cursor);

        expect(result.cursor).toBe(2);
      });

      it('should go right before script', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'superscript', text: [] },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 0;

        const result = Cursor.right(text, cursor);

        expect(result.cursor).toBe(1);
      });

      it('should go right before double script', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'superscript', text: [] },
          { type: 'subscript', text: [] },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 0;

        const result = Cursor.right(text, cursor);

        expect(result.cursor).toBe(1);
      });

      it('should skip superscript and subscript when going right', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'superscript', text: [] },
          { type: 'subscript', text: [] },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.right(text, cursor);

        expect(result.cursor).toBe(3);
      });

      it('should not move cursor when the cursor is at the end of the text', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 2;

        const result = Cursor.right(text, cursor);

        expect(result.cursor).toBe(2);
      });

      it('should move cursor to the end when text ends with subscript', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'subscript', text: [] },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.right(text, cursor);

        expect(result.cursor).toBe(2);
      });

      it('should move cursor to the end when text ends with superscript', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'superscript', text: [] },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.right(text, cursor);

        expect(result.cursor).toBe(2);
      });

      it('should move cursor to the end when text ends with subscript and superscript', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'subscript', text: [] },
          { type: 'superscript', text: [] },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.right(text, cursor);

        expect(result.cursor).toBe(3);
      });

      describe('word jump', () => {
        it('should not jump when text is empty', () => {
          const text = [] as AbstractText;
          const cursor = 0;

          const result = Cursor.right(text, cursor, 'normal', 'word');

          expect(result.cursor).toBe(0);
        });

        it('should jump to the end of the word from the start', () => {
          const text = [
            { type: 'variable', name: 'a' },
            { type: 'variable', name: 'b' },
          ] as AbstractText;
          const cursor = 0;

          const result = Cursor.right(text, cursor, 'normal', 'word');

          expect(result.cursor).toBe(2);
        });

        it('should jump to the end of the word from the middle of the word', () => {
          const text = [
            { type: 'variable', name: 'a' },
            { type: 'variable', name: 'b' },
            { type: 'variable', name: 'c' },
          ] as AbstractText;
          const cursor = 1;

          const result = Cursor.right(text, cursor, 'normal', 'word');

          expect(result.cursor).toBe(3);
        });

        it('should jump to the end of the next word from the end of the word', () => {
          const text = [
            { type: 'variable', name: 'a' },
            { type: 'variable', name: 'b' },
            { type: 'space' },
            { type: 'variable', name: 'c' },
            { type: 'variable', name: 'd' },
          ] as AbstractText;
          const cursor = 2;

          const result = Cursor.right(text, cursor, 'normal', 'word');

          expect(result.cursor).toBe(5);
        });

        it('should not move from the end of the last word', () => {
          const text = [
            { type: 'variable', name: 'a' },
            { type: 'variable', name: 'b' },
            { type: 'space' },
            { type: 'variable', name: 'c' },
            { type: 'variable', name: 'd' },
          ] as AbstractText;
          const cursor = 5;

          const result = Cursor.right(text, cursor, 'normal', 'word');

          expect(result.cursor).toBe(5);
        });
      });

      describe('line jump', () => {
        it('should jump to end of line from the start', () => {
          const text = [
            { type: 'variable', name: 'a' },
            { type: 'space' },
            { type: 'variable', name: 'b' },
            { type: 'space' },
            { type: 'variable', name: 'c' },
          ] as AbstractText;
          const cursor = 0;

          const result = Cursor.right(text, cursor, 'normal', 'line');

          expect(result.cursor).toBe(6);
        });

        it('should jump to end of line from the middle', () => {
          const text = [
            { type: 'variable', name: 'a' },
            { type: 'space' },
            { type: 'variable', name: 'b' },
            { type: 'space' },
            { type: 'variable', name: 'c' },
          ] as AbstractText;
          const cursor = 2;

          const result = Cursor.right(text, cursor, 'normal', 'line');

          expect(result.cursor).toBe(6);
        });

        it('should jump to end of line from the end', () => {
          const text = [
            { type: 'variable', name: 'a' },
            { type: 'space' },
            { type: 'variable', name: 'b' },
            { type: 'space' },
            { type: 'variable', name: 'c' },
          ] as AbstractText;
          const cursor = 4;

          const result = Cursor.right(text, cursor, 'normal', 'line');

          expect(result.cursor).toBe(6);
        });
      });
    });

    describe('left', () => {
      it('should not go left in empty text', () => {
        const text = [] as AbstractText;
        const cursor = 0;

        const result = Cursor.left(text, cursor);

        expect(result.cursor).toBe(0);
      });

      it('should go left once', () => {
        const text = [{ type: 'variable', name: 'a' }] as AbstractText;
        const cursor = 1;

        const result = Cursor.left(text, cursor);

        expect(result.cursor).toBe(0);
      });

      it('should not go left when the cursor is at the beginning of the text', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 0;

        const result = Cursor.left(text, cursor);

        expect(result.cursor).toBe(0);
      });

      it('should skip subscript when going left', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'subscript', text: [] },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 2;

        const result = Cursor.left(text, cursor);

        expect(result.cursor).toBe(1);
      });

      it('should skip superscript when going left', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'superscript', text: [] },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 2;

        const result = Cursor.left(text, cursor);

        expect(result.cursor).toBe(1);
      });

      it('should go left before script', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'superscript', text: [] },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 2;

        const result = Cursor.left(text, cursor);

        expect(result.cursor).toBe(1);
      });

      it('should go left before double script', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'superscript', text: [] },
          { type: 'subscript', text: [] },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 3;

        const result = Cursor.left(text, cursor);

        expect(result.cursor).toBe(1);
      });

      it('should skip superscript and subscript when going left', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'superscript', text: [] },
          { type: 'subscript', text: [] },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 3;

        const result = Cursor.left(text, cursor);
        expect(result.cursor).toBe(1);
      });
      describe('word jump', () => {
        it('should not jump when text is empty', () => {
          const text = [] as AbstractText;
          const cursor = 0;

          const result = Cursor.left(text, cursor, 'normal', 'word');

          expect(result.cursor).toBe(0);
        });

        it('should jump to the start of the word from the end of the word', () => {
          const text = [
            { type: 'variable', name: 'a' },
            { type: 'variable', name: 'b' },
          ] as AbstractText;
          const cursor = 2;

          const result = Cursor.left(text, cursor, 'normal', 'word');

          expect(result.cursor).toBe(0);
        });

        it('should jump to the start of the word from the middle of the word', () => {
          const text = [
            { type: 'variable', name: 'a' },
            { type: 'variable', name: 'b' },
            { type: 'variable', name: 'c' },
          ] as AbstractText;
          const cursor = 2;

          const result = Cursor.left(text, cursor, 'normal', 'word');

          expect(result.cursor).toBe(0);
        });

        it('should jump to the end of the previous word from the start of the word', () => {
          const text = [
            { type: 'variable', name: 'a' },
            { type: 'variable', name: 'b' },
            { type: 'space' },
            { type: 'variable', name: 'c' },
            { type: 'variable', name: 'd' },
          ] as AbstractText;
          const cursor = 3;

          const result = Cursor.left(text, cursor, 'normal', 'word');

          expect(result.cursor).toBe(2);
        });

        it('should not move from the start of the first word', () => {
          const text = [
            { type: 'variable', name: 'a' },
            { type: 'variable', name: 'b' },
            { type: 'space' },
            { type: 'variable', name: 'c' },
            { type: 'variable', name: 'd' },
          ] as AbstractText;
          const cursor = 0;

          const result = Cursor.left(text, cursor, 'normal', 'word');

          expect(result.cursor).toBe(0);
        });
      });

      describe('line jump', () => {
        it('should jump to start of line from the end', () => {
          const text = [
            { type: 'variable', name: 'a' },
            { type: 'space' },
            { type: 'variable', name: 'b' },
            { type: 'space' },
            { type: 'variable', name: 'c' },
          ] as AbstractText;
          const cursor = 5;

          const result = Cursor.left(text, cursor, 'normal', 'line');

          expect(result.cursor).toBe(0);
        });

        it('should jump to start of line from the middle', () => {
          const text = [
            { type: 'variable', name: 'a' },
            { type: 'space' },
            { type: 'variable', name: 'b' },
            { type: 'space' },
            { type: 'variable', name: 'c' },
          ] as AbstractText;
          const cursor = 2;

          const result = Cursor.left(text, cursor, 'normal', 'line');

          expect(result.cursor).toBe(0);
        });

        it('should jump to start of line from the start', () => {
          const text = [
            { type: 'variable', name: 'a' },
            { type: 'space' },
            { type: 'variable', name: 'b' },
            { type: 'space' },
            { type: 'variable', name: 'c' },
          ] as AbstractText;
          const cursor = 0;

          const result = Cursor.left(text, cursor, 'normal', 'line');

          expect(result.cursor).toBe(0);
        });
      });
    });

    describe('up', () => {
      it('should not go up in empty text', () => {
        const text = [] as AbstractText;
        const cursor = 0;
        const result = Cursor.up(text, cursor);
        expect(result.cursor).toBe(0);
      });

      it('should go up once', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'superscript', text: [{ type: 'variable', name: 'b' }] },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.up(text, cursor);

        expect(result.cursor).toBe(1);
        expect(result.insertMode).toBe('superscript');
      });

      it('should go up from char before script', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'superscript', text: [{ type: 'variable', name: 'b' }] },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 2;
        const result = Cursor.up(text, cursor);
        expect(result.cursor).toBe(2);
        expect(result.insertMode).toBe('superscript');
      });

      it('should go up from char right after script', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'superscript', text: [{ type: 'variable', name: 'b' }] },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 2;
        const result = Cursor.up(text, cursor);
        expect(result.cursor).toBe(2);
        expect(result.insertMode).toBe('superscript');
      });

      it('should go up from char before double script', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'subscript', text: [{ type: 'variable', name: 'c' }] },
          { type: 'superscript', text: [{ type: 'variable', name: 'b' }] },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 2;
        const result = Cursor.up(text, cursor);
        expect(result.cursor).toBe(2);
        expect(result.insertMode).toBe('superscript');
      });

      it('should go up from char right after double script', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'superscript', text: [{ type: 'variable', name: 'b' }] },
          { type: 'subscript', text: [{ type: 'variable', name: 'c' }] },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 2;
        const result = Cursor.up(text, cursor);
        expect(result.cursor).toBe(2);
        expect(result.insertMode).toBe('superscript');
      });

      it('should not go up when there is no superscript', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 1;
        const result = Cursor.up(text, cursor);
        expect(result.cursor).toBe(1);
      });

      it('should not go up from a char before script', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'variable', name: 'b' },
          { type: 'superscript', text: [{ type: 'variable', name: 'b' }] },
        ] as AbstractText;
        const cursor = 1;
        const result = Cursor.up(text, cursor);
        expect(result.cursor).toBe(1);
        expect(result.insertMode).toBe('normal');
      });

      it('should not go up from a char after script', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'superscript', text: [{ type: 'variable', name: 'b' }] },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 3;
        const result = Cursor.up(text, cursor);
        expect(result.cursor).toBe(3);
        expect(result.insertMode).toBe('normal');
      });

      it('should not go up on a subscript', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'subscript', text: [{ type: 'variable', name: 'b' }] },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.up(text, cursor);

        expect(result.cursor).toBe(1);
      });
      it('should leave subscript', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'subscript', text: [{ type: 'variable', name: 'b' }] },
          { type: 'variable', name: 'c' },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.up(text, cursor, 'subscript');

        expect(result.cursor).toBe(1);
        expect(result.insertMode).toBe('normal');
      });
    });

    describe('down', () => {
      it('should not go down in empty text', () => {
        const text = [] as AbstractText;
        const cursor = 0;
        const result = Cursor.down(text, cursor);
        expect(result.cursor).toBe(0);
      });

      it('should go down once', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'subscript', text: [{ type: 'variable', name: 'b' }] },
        ] as AbstractText;
        const cursor = 2;

        const result = Cursor.down(text, cursor);

        expect(result.cursor).toBe(2);
        expect(result.insertMode).toBe('subscript');
      });

      it('should go down from  char before script', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'subscript', text: [{ type: 'variable', name: 'b' }] },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 2;
        const result = Cursor.down(text, cursor);
        expect(result.cursor).toBe(2);
        expect(result.insertMode).toBe('subscript');
      });

      it('should go down from char right after script', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'subscript', text: [{ type: 'variable', name: 'b' }] },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 2;
        const result = Cursor.down(text, cursor);
        expect(result.cursor).toBe(2);
        expect(result.insertMode).toBe('subscript');
      });

      it('should not go down when there is no subscript', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 1;
        const result = Cursor.down(text, cursor);
        expect(result.cursor).toBe(1);
        expect(result.insertMode).toBe('normal');
      });

      it('should not go down from a char before script', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'variable', name: 'b' },
          { type: 'subscript', text: [{ type: 'variable', name: 'b' }] },
        ] as AbstractText;
        const cursor = 1;
        const result = Cursor.down(text, cursor);
        expect(result.cursor).toBe(1);
        expect(result.insertMode).toBe('normal');
      });

      it('should not go down from a char after script', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'subscript', text: [{ type: 'variable', name: 'b' }] },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 4;
        const result = Cursor.down(text, cursor);
        expect(result.cursor).toBe(4);
        expect(result.insertMode).toBe('normal');
      });

      it('should go down from char before double script', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'superscript', text: [{ type: 'variable', name: 'b' }] },
          { type: 'subscript', text: [{ type: 'variable', name: 'c' }] },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 2;
        const result = Cursor.down(text, cursor);
        expect(result.cursor).toBe(2);
        expect(result.insertMode).toBe('subscript');
      });

      it('should down up from char right after double script', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'subscript', text: [{ type: 'variable', name: 'c' }] },
          { type: 'superscript', text: [{ type: 'variable', name: 'b' }] },
          { type: 'variable', name: 'b' },
        ] as AbstractText;
        const cursor = 2;
        const result = Cursor.down(text, cursor);
        expect(result.cursor).toBe(2);
        expect(result.insertMode).toBe('subscript');
      });

      it('should not go down on a superscript', () => {
        const text = [
          { type: 'variable', name: 'a' },
          { type: 'superscript', text: [{ type: 'variable', name: 'b' }] },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.down(text, cursor);

        expect(result.cursor).toBe(1);
        expect(result.insertMode).toBe('normal');
      });
    });
  });
});
