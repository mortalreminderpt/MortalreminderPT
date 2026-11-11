import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const cardDefinitions = [
  { id: 'stats-en', file: 'github-stats.svg', kind: 'stats', language: 'en' },
  { id: 'languages-en', file: 'top-languages.svg', kind: 'top-langs', language: 'en' },
  { id: 'stats-zh-cn', file: 'github-stats-zh-cn.svg', kind: 'stats', language: 'zh-cn' },
  { id: 'languages-zh-cn', file: 'top-languages-zh-cn.svg', kind: 'top-langs', language: 'zh-cn' },
];
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const exists = async file => { try { await fs.access(file); return true; } catch { return false; } };
const xmlInspector = `import sys,json,xml.etree.ElementTree as E
root=E.fromstring(sys.stdin.read())
assert root.tag=='{http://www.w3.org/2000/svg}svg'
texts=[''.join(el.itertext()).strip() for el in root.iter() if el.tag.rsplit('}',1)[-1]=='text']
assert len([text for text in texts if text])>=3
assert len(list(root.iter()))>=5
for el in root.iter():
 tag=el.tag.rsplit('}',1)[-1].lower()
 assert tag not in ['script','foreignobject','image','iframe','object','embed']
 for name,value in el.attrib.items():
  local=name.rsplit('}',1)[-1].lower()
  assert not local.startswith('on')
  if local=='href': assert value.startswith('#')
print(json.dumps({'width':root.get('width'),'height':root.get('height'),'viewBox':root.get('viewBox'),'textCount':len(texts)}))`;

export function validateCard(bytes, { secrets = [] } = {}) {
  if (!Buffer.isBuffer(bytes)) bytes = Buffer.from(bytes);
  if (bytes.length < 200 || bytes.length > 512000) throw new Error('invalid-size');
  let svg;
  try { svg = new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { throw new Error('invalid-encoding'); }
  if (!/<\/svg>\s*$/i.test(svg) || /<!DOCTYPE|<!ENTITY|<html\b|@import|url\(\s*["']?https?:/i.test(svg)) throw new Error('invalid-svg');
  if (/Something went wrong|Bad credentials|API rate limit|Could not fetch|Resource not accessible|data-testid=["']error/i.test(svg)) throw new Error('upstream-error-card');
  if (secrets.some(secret => secret && svg.includes(secret))) throw new Error('credential-in-output');
  let metadata;
  try { metadata = JSON.parse(execFileSync('python3', ['-c', xmlInspector], { input: svg, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })); }
  catch { throw new Error('invalid-svg-structure'); }
  if (!(Number.parseFloat(metadata.width) > 0) || !(Number.parseFloat(metadata.height) > 0)) throw new Error('invalid-dimensions');
  return { ...metadata, bytes: bytes.length, sha256: hash(bytes) };
}

export async function promoteCards({ stageDir = '.generated/github-cards', cacheDir = 'public/images/github', now = new Date().toISOString(), secrets = [] } = {}) {
  const candidates = [], failures = [];
  for (const definition of cardDefinitions) {
    try {
      const bytes = await fs.readFile(path.join(stageDir, definition.file));
      candidates.push({ definition, bytes, metadata: validateCard(bytes, { secrets }) });
    } catch (error) { failures.push({ card: definition.id, reason: error.code === 'ENOENT' ? 'missing-candidate' : error.message }); }
  }
  if (failures.length) {
    for (const definition of cardDefinitions) {
      try { validateCard(await fs.readFile(path.join(cacheDir, definition.file)), { secrets }); }
      catch { throw new Error('No complete valid card snapshot is available; publishing is blocked.'); }
    }
    return { updated: false, retained: cardDefinitions.length, failures };
  }
  await fs.mkdir(cacheDir, { recursive: true });
  for (const { definition, bytes } of candidates) {
    const target = path.join(cacheDir, definition.file), temporary = target + '.' + process.pid + '.tmp';
    await fs.writeFile(temporary, bytes); await fs.rename(temporary, target);
  }
  const status = {
    schema: 1, username: 'mortalreminderpt', updatedAt: now,
    generator: { repository: 'stats-organization/github-readme-stats-action', revision: '2c498845f71017821efaad14293ebc736156ef21', core: '2.2.0' },
    cards: Object.fromEntries(candidates.map(({ definition, metadata }) => [definition.id, { file: definition.file, language: definition.language, ...metadata }])),
  };
  await fs.writeFile(path.join(cacheDir, 'status.json'), JSON.stringify(status, null, 2) + '\n');
  return { updated: true, retained: 0, cards: candidates.length, status };
}

export async function verifySavedCards(cacheDir = 'public/images/github') {
  const result = [];
  for (const definition of cardDefinitions) result.push({ id: definition.id, ...validateCard(await fs.readFile(path.join(cacheDir, definition.file))) });
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const command = process.argv[2] || 'promote';
  try {
    if (command === 'prepare') {
      const directory = '.generated/github-cards';
      if (await exists(directory)) await fs.rm(directory, { recursive: true });
      await fs.mkdir(directory, { recursive: true });
      console.log('Prepared a separate staging directory for card generation.');
    } else if (command === 'check') {
      console.log(JSON.stringify({ valid: true, cards: await verifySavedCards() }, null, 2));
    } else if (command === 'promote') {
      const result = await promoteCards({ secrets: [process.env.GITHUB_CARDS_TOKEN, process.env.DEEPSEEK_API_KEY].filter(Boolean) });
      console.log(JSON.stringify(result.updated ? { updated: true, cards: result.cards } : result, null, 2));
      if (!result.updated) console.log('::warning::Card refresh failed; retained the complete last successful snapshot.');
    } else throw new Error('Unknown card command');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
