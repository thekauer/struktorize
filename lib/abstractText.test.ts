import { Cursor } from './abstractText';
import { AbstractText } from './ast';

describe('AbstractText', () => {
  describe('cursor', () => {
    describe('wordUnderCursor', () => {
      it('should return null for empty text', () => {
        const text = [] as AbstractText;
        const cursor = 0;

        const result = Cursor.currentWord(text, cursor, 0);

        expect(result).toBe(null);
      });

      it('should return a when the text is a from the left side', () => {
        const text = [{ type: 'char', value: 'a' }] as AbstractText;
        const cursor = 0;

        const result = Cursor.currentWord(text, cursor, 0);

        expect(result).toBe('a');
      });

      it('should return a when the text is a from the right side', () => {
        const text = [
          { type: 'char', value: 'a' },
          { type: 'space' },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.currentWord(text, cursor, 0);

        expect(result).toBe('a');
      });

      it('should return null for space', () => {
        const text = [
          { type: 'char', value: 'a' },
          { type: 'space' },
        ] as AbstractText;
        const cursor = 2;

        const result = Cursor.currentWord(text, cursor, 0);

        expect(result).toBe(null);
      });
    });

    describe('right', () => {
      it('should not go right in empty text', () => {
        const text = [] as AbstractText;
        const cursor = 0;

        const result = Cursor.right(text, cursor, 0);

        expect(result.cursor).toBe(0);
      });

      it('should go right once', () => {
        const text = [{ type: 'char', value: 'a' }] as AbstractText;
        const cursor = 0;

        const result = Cursor.right(text, cursor, 0);

        expect(result.cursor).toBe(1);
      });

      it('should not go right when the cursor is at the end of the text', () => {
        const text = [
          { type: 'char', value: 'a' },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 2;

        const result = Cursor.right(text, cursor, 0);

        expect(result.cursor).toBe(2);
      });

      it('should skip subscript when going right', () => {
        const text = [
          { type: 'char', value: 'a' },
          { type: 'subscript', text: [] },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.right(text, cursor, 0);

        expect(result.cursor).toBe(2);
      });

      it('should skip superscript when going right', () => {
        const text = [
          { type: 'char', value: 'a' },
          { type: 'superscript', text: [] },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.right(text, cursor, 0);

        expect(result.cursor).toBe(2);
      });

      it('should go right before script', () => {
        const text = [
          { type: 'char', value: 'a' },
          { type: 'superscript', text: [] },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 0;

        const result = Cursor.right(text, cursor, 0);

        expect(result.cursor).toBe(1);
      });

      it('should go right before double script', () => {
        const text = [
          { type: 'char', value: 'a' },
          { type: 'superscript', text: [] },
          { type: 'subscript', text: [] },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 0;

        const result = Cursor.right(text, cursor, 0);

        expect(result.cursor).toBe(1);
      });

      it('should skip superscript and subscript when going right', () => {
        const text = [
          { type: 'char', value: 'a' },
          {
            type: 'script',
            superscript: { type: 'superscript', text: [] },
            subscript: { type: 'subscript', text: [] },
          },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.right(text, cursor, 0);

        expect(result.cursor).toBe(2);
      });

      it('should not move cursor when the cursor is at the end of the text', () => {
        const text = [
          { type: 'char', value: 'a' },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 2;

        const result = Cursor.right(text, cursor, 0);

        expect(result.cursor).toBe(2);
      });

      it('should move cursor to the end when text ends with subscript', () => {
        const text = [
          { type: 'char', value: 'a' },
          { type: 'subscript', text: [] },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.right(text, cursor, 0);

        expect(result.cursor).toBe(2);
      });

      it('should move cursor to the end when text ends with superscript', () => {
        const text = [
          { type: 'char', value: 'a' },
          { type: 'superscript', text: [] },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.right(text, cursor, 0);

        expect(result.cursor).toBe(2);
      });

      it('should move cursor to the end when text ends with subscript and superscript', () => {
        const text = [
          { type: 'char', value: 'a' },
          {
            type: 'script',
            subscript: { type: 'subscript', text: [] },
            superscript: { type: 'superscript', text: [] },
          },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.right(text, cursor, 0);

        expect(result.cursor).toBe(2);
      });

      describe('index', () => {
        it('should move right once in superscript', () => {
          const text = [
            { type: 'char', value: 'a' },
            {
              type: 'script',
              superscript: {
                type: 'superscript',
                text: [
                  { type: 'char', value: 'b' },
                  { type: 'char', value: 'b' },
                ],
              },
            },
            { type: 'char', value: 'b' },
          ] as AbstractText;
          const cursor = 1;
          const index = 0;

          const result = Cursor.right(text, cursor, index, 'superscript');

          expect(result.cursor).toBe(1);
          expect(result.indexCursor).toBe(1);
          expect(result.insertMode).toBe('superscript');
        });

        it('should not move right from the end of the superscript', () => {
          const text = [
            { type: 'char', value: 'a' },
            {
              type: 'script',
              superscript: {
                type: 'superscript',
                text: [
                  { type: 'char', value: 'b' },
                  { type: 'char', value: 'b' },
                ],
              },
            },
            { type: 'char', value: 'b' },
          ] as AbstractText;
          const cursor = 1;
          const index = 2;

          const result = Cursor.right(text, cursor, index, 'superscript');

          expect(result.cursor).toBe(1);
          expect(result.indexCursor).toBe(2);
          expect(result.insertMode).toBe('superscript');
        });
      });

      describe('word jump', () => {
        it('should not jump when text is empty', () => {
          const text = [] as AbstractText;
          const cursor = 0;

          const result = Cursor.right(text, cursor, 0, 'normal', 'word');

          expect(result.cursor).toBe(0);
        });

        it('should jump to the end of the word from the start', () => {
          const text = [
            { type: 'char', value: 'a' },
            { type: 'char', value: 'b' },
          ] as AbstractText;
          const cursor = 0;

          const result = Cursor.right(text, cursor, 0, 'normal', 'word');

          expect(result.cursor).toBe(2);
        });

        it('should jump to the end of the word from the middle of the word', () => {
          const text = [
            { type: 'char', value: 'a' },
            { type: 'char', value: 'b' },
            { type: 'char', value: 'c' },
          ] as AbstractText;
          const cursor = 1;

          const result = Cursor.right(text, cursor, 0, 'normal', 'word');

          expect(result.cursor).toBe(3);
        });

        it('should jump to the end of the next word from the end of the word', () => {
          const text = [
            { type: 'char', value: 'a' },
            { type: 'char', value: 'b' },
            { type: 'space' },
            { type: 'char', value: 'c' },
            { type: 'char', value: 'd' },
          ] as AbstractText;
          const cursor = 2;

          const result = Cursor.right(text, cursor, 0, 'normal', 'word');

          expect(result.cursor).toBe(5);
        });

        it('should not move from the end of the last word', () => {
          const text = [
            { type: 'char', value: 'a' },
            { type: 'char', value: 'b' },
            { type: 'space' },
            { type: 'char', value: 'c' },
            { type: 'char', value: 'd' },
          ] as AbstractText;
          const cursor = 5;

          const result = Cursor.right(text, cursor, 0, 'normal', 'word');

          expect(result.cursor).toBe(5);
        });
      });

      describe('line jump', () => {
        it('should jump to end of line from the start', () => {
          const text = [
            { type: 'char', value: 'a' },
            { type: 'space' },
            { type: 'char', value: 'b' },
            { type: 'space' },
            { type: 'char', value: 'c' },
          ] as AbstractText;
          const cursor = 0;

          const result = Cursor.right(text, cursor, 0, 'normal', 'line');

          expect(result.cursor).toBe(5);
        });

        it('should jump to end of line from the middle', () => {
          const text = [
            { type: 'char', value: 'a' },
            { type: 'space' },
            { type: 'char', value: 'b' },
            { type: 'space' },
            { type: 'char', value: 'c' },
          ] as AbstractText;
          const cursor = 2;

          const result = Cursor.right(text, cursor, 0, 'normal', 'line');

          expect(result.cursor).toBe(5);
        });

        it('should jump to end of line from the end', () => {
          const text = [
            { type: 'char', value: 'a' },
            { type: 'space' },
            { type: 'char', value: 'b' },
            { type: 'space' },
            { type: 'char', value: 'c' },
          ] as AbstractText;
          const cursor = 4;

          const result = Cursor.right(text, cursor, 0, 'normal', 'line');

          expect(result.cursor).toBe(5);
        });
      });
    });

    describe('left', () => {
      it('should not go left in empty text', () => {
        const text = [] as AbstractText;
        const cursor = 0;

        const result = Cursor.left(text, cursor, 0);

        expect(result.cursor).toBe(0);
      });

      it('should go left once', () => {
        const text = [{ type: 'char', value: 'a' }] as AbstractText;
        const cursor = 1;

        const result = Cursor.left(text, cursor, 0);

        expect(result.cursor).toBe(0);
      });

      it('should not go left when the cursor is at the beginning of the text', () => {
        const text = [
          { type: 'char', value: 'a' },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 0;

        const result = Cursor.left(text, cursor, 0);

        expect(result.cursor).toBe(0);
      });

      it('should skip subscript when going left', () => {
        const text = [
          { type: 'char', value: 'a' },
          { type: 'subscript', text: [] },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 2;

        const result = Cursor.left(text, cursor, 0);

        expect(result.cursor).toBe(1);
      });

      it('should skip superscript when going left', () => {
        const text = [
          { type: 'char', value: 'a' },
          { type: 'superscript', text: [] },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 2;

        const result = Cursor.left(text, cursor, 0);

        expect(result.cursor).toBe(1);
      });

      it('should go left before script', () => {
        const text = [
          { type: 'char', value: 'a' },
          { type: 'superscript', text: [] },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 2;

        const result = Cursor.left(text, cursor, 0);

        expect(result.cursor).toBe(1);
      });

      it('should go left before double script', () => {
        const text = [
          { type: 'char', value: 'a' },
          {
            type: 'script',
            superscript: { type: 'superscript', text: [] },
            subscript: { type: 'subscript', text: [] },
          },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 2;

        const result = Cursor.left(text, cursor, 0);

        expect(result.cursor).toBe(1);
      });

      it('should skip superscript and subscript when going left', () => {
        const text = [
          { type: 'char', value: 'a' },
          {
            type: 'script',
            superscript: { type: 'superscript', text: [] },
            subscript: { type: 'subscript', text: [] },
          },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 3;

        const result = Cursor.left(text, cursor, 0);
        expect(result.cursor).toBe(2);
      });
      describe('word jump', () => {
        it('should not jump when text is empty', () => {
          const text = [] as AbstractText;
          const cursor = 0;

          const result = Cursor.left(text, cursor, 0, 'normal', 'word');

          expect(result.cursor).toBe(0);
        });

        it('should jump to the start of the word from the end of the word', () => {
          const text = [
            { type: 'char', value: 'a' },
            { type: 'char', value: 'b' },
          ] as AbstractText;
          const cursor = 2;

          const result = Cursor.left(text, cursor, 0, 'normal', 'word');

          expect(result.cursor).toBe(0);
        });

        it('should jump to the start of the word from the middle of the word', () => {
          const text = [
            { type: 'char', value: 'a' },
            { type: 'char', value: 'b' },
            { type: 'char', value: 'c' },
          ] as AbstractText;
          const cursor = 2;

          const result = Cursor.left(text, cursor, 0, 'normal', 'word');

          expect(result.cursor).toBe(0);
        });

        it('should jump to the end of the previous word from the start of the word', () => {
          const text = [
            { type: 'char', value: 'a' },
            { type: 'char', value: 'b' },
            { type: 'space' },
            { type: 'char', value: 'c' },
            { type: 'char', value: 'd' },
          ] as AbstractText;
          const cursor = 3;

          const result = Cursor.left(text, cursor, 0, 'normal', 'word');

          expect(result.cursor).toBe(2);
        });

        it('should not move from the start of the first word', () => {
          const text = [
            { type: 'char', value: 'a' },
            { type: 'char', value: 'b' },
            { type: 'space' },
            { type: 'char', value: 'c' },
            { type: 'char', value: 'd' },
          ] as AbstractText;
          const cursor = 0;

          const result = Cursor.left(text, cursor, 0, 'normal', 'word');

          expect(result.cursor).toBe(0);
        });
      });

      describe('line jump', () => {
        it('should jump to start of line from the end', () => {
          const text = [
            { type: 'char', value: 'a' },
            { type: 'space' },
            { type: 'char', value: 'b' },
            { type: 'space' },
            { type: 'char', value: 'c' },
          ] as AbstractText;
          const cursor = 5;

          const result = Cursor.left(text, cursor, 0, 'normal', 'line');

          expect(result.cursor).toBe(0);
        });

        it('should jump to start of line from the middle', () => {
          const text = [
            { type: 'char', value: 'a' },
            { type: 'space' },
            { type: 'char', value: 'b' },
            { type: 'space' },
            { type: 'char', value: 'c' },
          ] as AbstractText;
          const cursor = 2;

          const result = Cursor.left(text, cursor, 0, 'normal', 'line');

          expect(result.cursor).toBe(0);
        });

        it('should jump to start of line from the start', () => {
          const text = [
            { type: 'char', value: 'a' },
            { type: 'space' },
            { type: 'char', value: 'b' },
            { type: 'space' },
            { type: 'char', value: 'c' },
          ] as AbstractText;
          const cursor = 0;

          const result = Cursor.left(text, cursor, 0, 'normal', 'line');

          expect(result.cursor).toBe(0);
        });
      });
    });

    describe('up', () => {
      it('should not go up in empty text', () => {
        const text = [] as AbstractText;
        const cursor = 0;
        const result = Cursor.up(text, cursor, 0);
        expect(result.cursor).toBe(0);
      });

      it('should go up once', () => {
        const text = [
          { type: 'char', value: 'a' },
          {
            type: 'script',
            superscript: {
              type: 'superscript',
              text: [{ type: 'char', value: 'b' }],
            },
          },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.up(text, cursor, 0);

        expect(result.cursor).toBe(1);
        expect(result.insertMode).toBe('superscript');
      });

      it('should go up from char before script', () => {
        const text = [
          { type: 'char', value: 'a' },
          {
            type: 'script',
            superscript: {
              type: 'superscript',
              text: [{ type: 'char', value: 'b' }],
            },
          },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 2;
        const result = Cursor.up(text, cursor, 0);
        expect(result.cursor).toBe(2);
        expect(result.insertMode).toBe('superscript');
      });

      it('should go up from char right after script', () => {
        const text = [
          { type: 'char', value: 'a' },
          {
            type: 'script',
            superscript: {
              type: 'superscript',
              text: [{ type: 'char', value: 'b' }],
            },
          },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 2;
        const result = Cursor.up(text, cursor, 0);
        expect(result.cursor).toBe(2);
        expect(result.insertMode).toBe('superscript');
      });

      it('should go up from char before double script', () => {
        const text = [
          { type: 'char', value: 'a' },
          {
            type: 'script',
            subscript: {
              type: 'subscript',
              text: [{ type: 'char', value: 'c' }],
            },
            superscript: {
              type: 'superscript',
              text: [{ type: 'char', value: 'b' }],
            },
          },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 2;
        const result = Cursor.up(text, cursor, 0);
        expect(result.cursor).toBe(2);
        expect(result.insertMode).toBe('superscript');
      });

      it('should go up from char right after double script', () => {
        const text = [
          { type: 'char', value: 'a' },
          {
            type: 'script',
            superscript: {
              type: 'superscript',
              text: [{ type: 'char', value: 'b' }],
            },
            subscript: {
              type: 'subscript',
              text: [{ type: 'char', value: 'c' }],
            },
          },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 2;
        const result = Cursor.up(text, cursor, 0);
        expect(result.cursor).toBe(2);
        expect(result.insertMode).toBe('superscript');
      });

      it('should not go up when there is no superscript', () => {
        const text = [
          { type: 'char', value: 'a' },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 1;
        const result = Cursor.up(text, cursor, 0);
        expect(result.cursor).toBe(1);
      });

      it('should not go up from a char before script', () => {
        const text = [
          { type: 'char', value: 'a' },
          { type: 'char', value: 'b' },
          {
            type: 'script',
            superscript: {
              type: 'superscript',
              text: [{ type: 'char', value: 'b' }],
            },
          },
        ] as AbstractText;
        const cursor = 1;
        const result = Cursor.up(text, cursor, 0);
        expect(result.cursor).toBe(1);
        expect(result.insertMode).toBe('normal');
      });

      it('should not go up from a char after script', () => {
        const text = [
          { type: 'char', value: 'a' },
          {
            type: 'script',
            superscript: {
              type: 'superscript',
              text: [{ type: 'char', value: 'b' }],
            },
          },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 3;
        const result = Cursor.up(text, cursor, 0);
        expect(result.cursor).toBe(3);
        expect(result.insertMode).toBe('normal');
      });

      it('should not go up on a subscript', () => {
        const text = [
          { type: 'char', value: 'a' },
          {
            type: 'script',
            subscript: {
              type: 'subscript',
              text: [{ type: 'char', value: 'b' }],
            },
          },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.up(text, cursor, 0);

        expect(result.cursor).toBe(1);
      });
      it('should leave subscript', () => {
        const text = [
          { type: 'char', value: 'a' },
          {
            type: 'script',
            subscript: {
              type: 'subscript',
              text: [{ type: 'char', value: 'b' }],
            },
          },
          { type: 'char', value: 'c' },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.up(text, cursor, 0, 'subscript');

        expect(result.cursor).toBe(1);
        expect(result.insertMode).toBe('normal');
      });
    });

    describe('down', () => {
      it('should not go down in empty text', () => {
        const text = [] as AbstractText;
        const cursor = 0;
        const result = Cursor.down(text, cursor, 0);
        expect(result.cursor).toBe(0);
      });

      it('should go down once', () => {
        const text = [
          { type: 'char', value: 'a' },
          {
            type: 'script',
            subscript: {
              type: 'subscript',
              text: [{ type: 'char', value: 'b' }],
            },
          },
        ] as AbstractText;
        const cursor = 2;

        const result = Cursor.down(text, cursor, 0);

        expect(result.cursor).toBe(2);
        expect(result.insertMode).toBe('subscript');
      });

      it('should go down from  char before script', () => {
        const text = [
          { type: 'char', value: 'a' },
          {
            type: 'script',
            subscript: {
              type: 'subscript',
              text: [{ type: 'char', value: 'b' }],
            },
          },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 2;
        const result = Cursor.down(text, cursor, 0);
        expect(result.cursor).toBe(2);
        expect(result.insertMode).toBe('subscript');
      });

      it('should go down from char right after script', () => {
        const text = [
          { type: 'char', value: 'a' },
          {
            type: 'script',
            subscript: {
              type: 'subscript',
              text: [{ type: 'char', value: 'b' }],
            },
          },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 2;
        const result = Cursor.down(text, cursor, 0);
        expect(result.cursor).toBe(2);
        expect(result.insertMode).toBe('subscript');
      });

      it('should not go down when there is no subscript', () => {
        const text = [
          { type: 'char', value: 'a' },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 1;
        const result = Cursor.down(text, cursor, 0);
        expect(result.cursor).toBe(1);
        expect(result.insertMode).toBe('normal');
      });

      it('should not go down from a char before script', () => {
        const text = [
          { type: 'char', value: 'a' },
          { type: 'char', value: 'b' },
          {
            type: 'script',
            subscript: {
              type: 'subscript',
              text: [{ type: 'char', value: 'b' }],
            },
          },
        ] as AbstractText;
        const cursor = 1;
        const result = Cursor.down(text, cursor, 0);
        expect(result.cursor).toBe(1);
        expect(result.insertMode).toBe('normal');
      });

      it('should not go down from a char after script', () => {
        const text = [
          { type: 'char', value: 'a' },
          {
            type: 'script',
            subscript: {
              type: 'subscript',
              text: [{ type: 'char', value: 'b' }],
            },
          },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 4;
        const result = Cursor.down(text, cursor, 0);
        expect(result.cursor).toBe(4);
        expect(result.insertMode).toBe('normal');
      });

      it('should go down from char before double script', () => {
        const text = [
          { type: 'char', value: 'a' },
          {
            type: 'script',
            superscript: {
              type: 'superscript',
              text: [{ type: 'char', value: 'b' }],
            },
            subscript: {
              type: 'subscript',
              text: [{ type: 'char', value: 'c' }],
            },
          },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 2;
        const result = Cursor.down(text, cursor, 0);
        expect(result.cursor).toBe(2);
        expect(result.insertMode).toBe('subscript');
      });

      it('should down up from char right after double script', () => {
        const text = [
          { type: 'char', value: 'a' },
          {
            type: 'script',
            subscript: {
              type: 'subscript',
              text: [{ type: 'char', value: 'c' }],
            },
            superscript: {
              type: 'superscript',
              text: [{ type: 'char', value: 'b' }],
            },
          },
          { type: 'char', value: 'b' },
        ] as AbstractText;
        const cursor = 2;
        const result = Cursor.down(text, cursor, 0);
        expect(result.cursor).toBe(2);
        expect(result.insertMode).toBe('subscript');
      });

      it('should not go down on a superscript', () => {
        const text = [
          { type: 'char', value: 'a' },
          {
            type: 'script',
            superscript: {
              type: 'superscript',
              text: [{ type: 'char', value: 'b' }],
            },
          },
        ] as AbstractText;
        const cursor = 1;

        const result = Cursor.down(text, cursor, 0);

        expect(result.cursor).toBe(1);
        expect(result.insertMode).toBe('normal');
      });
    });
  });
});
