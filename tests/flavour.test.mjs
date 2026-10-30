import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const flavour = JSON.parse(await readFile(new URL('../data/flavour.json', import.meta.url)));
const sizes = { notes: 25, stamps: 25, scrawls: 50 };

for (const language of ['en', 'de']) {
  for (const [list, size] of Object.entries(sizes)) {
    test(`${language} ${list}: ${size} different lines`, () => {
      const lines = flavour[language][list];
      assert.equal(lines.length, size);
      assert.equal(new Set(lines.map((line) => line.toLowerCase())).size, size);
    });
  }
}
