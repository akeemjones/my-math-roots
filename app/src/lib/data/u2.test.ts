// app/src/lib/data/u2.test.ts
import { describe, it, expect } from 'vitest';
import { lessons } from './u2';

// Collect all qBank questions across all lessons
function allQuestions() {
  return lessons.flatMap((lesson: any) => lesson.qBank ?? []);
}

// Returns the digit in the tens place of a number string
function tensDigit(numStr: string): number {
  const n = parseInt(numStr.replace(/,/g, ''), 10);
  return Math.floor(n / 10) % 10;
}

describe('u2 curriculum data', () => {
  it('has exactly one option with 6 in the tens place for the tens-place question', () => {
    const q = allQuestions().find(
      (q: any) => q.t === 'Which number has a 6 in the tens place?'
    );
    expect(q).toBeDefined();
    const optionsWithSixInTens = (q as any).o.filter(
      (opt: string) => tensDigit(opt) === 6
    );
    expect(optionsWithSixInTens).toHaveLength(1);
    expect(optionsWithSixInTens[0]).toBe('463');
  });

  it('does not contain a question about 12 tens regrouping', () => {
    const q = allQuestions().find(
      (q: any) => q.t === 'What number has 12 tens, 4 hundreds, and 3 ones?'
    );
    expect(q).toBeUndefined();
  });

  it('contains the replacement Grade-2 compose question', () => {
    const q = allQuestions().find(
      (q: any) => q.t === 'What number has 5 hundreds, 2 tens, and 7 ones?'
    );
    expect(q).toBeDefined();
    expect((q as any).a).toBe(1);
    expect((q as any).o[1]).toBe('527');
  });
});
