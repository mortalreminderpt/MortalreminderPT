import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(process.env.STATIC_DIR || 'out');
const port = Number(process.env.PORT || 3100);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.xml': 'application/xml' };
http.createServer(async (req, res) => {
  let relative;
  try { relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  let filename = path.join(root, relative);
  if (!filename.startsWith(root + '/') && filename !== root) { res.writeHead(403).end(); return; }
  let status = 200;
  try {
    const stat = await fs.stat(filename);
    if (stat.isDirectory()) filename = path.join(filename, 'index.html');
    await fs.access(filename);
  } catch { filename = path.join(root, '404.html'); status = 404; }
  try {
    const data = await fs.readFile(filename);
    res.writeHead(status, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' });
    res.end(data);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(port, '0.0.0.0', () => console.log(`Local: http://localhost:${port}`));
