import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const questions = JSON.parse(readFileSync(new URL('../data/questions.json', import.meta.url)));

test('there are 25 questions', () => {
  assert.equal(questions.length, 25);
});

test('every question has its text and answer in both languages', () => {
  for (const item of questions) {
    assert.ok(item.question && item.answer, JSON.stringify(item));
    assert.ok(item.de?.question && item.de?.answer, item.question);
  }
});

test('no question appears twice', () => {
  assert.equal(new Set(questions.map((item) => item.question)).size, questions.length);
});
