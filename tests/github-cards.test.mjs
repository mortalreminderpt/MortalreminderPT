import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { cardDefinitions, validateCard, promoteCards } from '../scripts/github-cards.mjs';

const svg = label => `<svg xmlns="http://www.w3.org/2000/svg" width="495" height="195" viewBox="0 0 495 195"><title>GitHub statistics</title><g><text x="10" y="20">${label}</text><text x="10" y="40">Stars 20</text><text x="10" y="60">Commits 123</text></g></svg>`;
async function fixture(callback) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'mortalreminderpt-card-test-'));
  const stageDir = path.join(directory, 'staged'), cacheDir = path.join(directory, 'saved');
  await fs.mkdir(stageDir); await fs.mkdir(cacheDir);
  try { await callback({ stageDir, cacheDir }); } finally { await fs.rm(directory, { recursive: true }); }
}
test('accepts a complete self-contained SVG and rejects broken, unsafe or credential-bearing output', () => {
  assert.ok(validateCard(svg('Profile')).sha256);
  for (const value of ['', '<html>503 Service Unavailable</html>', svg('Profile').slice(0,-6), svg('Something went wrong'), svg('Profile').replace('</g>','<script>alert(1)</script></g>'), svg('Profile').replace('</g>','<image href="https://example.test/image.png"/></g>')]) assert.throws(() => validateCard(value));
  assert.throws(() => validateCard(svg('private-test-credential'), { secrets:['private-test-credential'] }));
});
test('refreshing all cards commits one complete validated snapshot', () => fixture(async options => {
  for (const card of cardDefinitions) await fs.writeFile(path.join(options.stageDir, card.file), svg(card.id));
  const result = await promoteCards({ ...options, now:'2026-11-11T12:00:00Z' });
  assert.equal(result.updated, true); assert.equal(result.cards, 4);
  for (const card of cardDefinitions) assert.equal(await fs.readFile(path.join(options.cacheDir,card.file),'utf8'),svg(card.id));
  assert.equal(JSON.parse(await fs.readFile(path.join(options.cacheDir,'status.json'),'utf8')).updatedAt,'2026-11-11T12:00:00Z');
}));
test('an outage or even one error card leaves every last-good image and timestamp byte-identical', () => fixture(async options => {
  for (const card of cardDefinitions) await fs.writeFile(path.join(options.stageDir,card.file),svg('Initial '+card.id));
  await promoteCards({ ...options, now:'2026-11-11T12:00:00Z' });
  const before = Object.fromEntries(await Promise.all((await fs.readdir(options.cacheDir)).map(async name=>[name,await fs.readFile(path.join(options.cacheDir,name),'utf8')])));
  for (const card of cardDefinitions) await fs.writeFile(path.join(options.stageDir,card.file),svg('Updated '+card.id));
  await fs.writeFile(path.join(options.stageDir,cardDefinitions[1].file),'<html>503 Service Unavailable</html>');
  let result = await promoteCards(options); assert.equal(result.updated,false);assert.equal(result.retained,4);
  for (const[name,bytes]of Object.entries(before))assert.equal(await fs.readFile(path.join(options.cacheDir,name),'utf8'),bytes);
  await fs.rm(options.stageDir,{recursive:true});await fs.mkdir(options.stageDir);result=await promoteCards(options);assert.equal(result.updated,false);
  for (const[name,bytes]of Object.entries(before))assert.equal(await fs.readFile(path.join(options.cacheDir,name),'utf8'),bytes);
}));
test('a first deployment without valid generated cards is blocked', () => fixture(async options => {
  await assert.rejects(()=>promoteCards(options),/publishing is blocked/);
}));
