import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
await mkdir('docs/admin', {recursive:true});
await copyFile('docs/index.html','docs/404.html');
const page=await readFile('docs/index.html','utf8');
await writeFile('docs/admin/index.html',page.replace('<head>','<head><meta name="robots" content="noindex,nofollow">'));
await copyFile('CNAME','docs/CNAME');
await writeFile('docs/.nojekyll','');

