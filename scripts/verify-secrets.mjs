import fs from 'node:fs/promises';
import path from 'node:path';

const secret=process.env.DEEPSEEK_API_KEY?.trim();
const violations=[];let files=0;
async function inspect(directory){
  for(const entry of await fs.readdir(directory,{withFileTypes:true})){
    const file=path.join(directory,entry.name);
    if(entry.isDirectory()){await inspect(file);continue;}
    files++;
    const bytes=await fs.readFile(file);
    if(secret&&bytes.includes(Buffer.from(secret)))violations.push({file,reason:'private credential present'});
    if(entry.name.startsWith('.env'))violations.push({file,reason:'environment file published'});
    if(file.startsWith('out/_next/')&&/\.js$/.test(file)&&/DEEPSEEK_API_KEY|api\.deepseek\.com\/chat\/completions/.test(bytes.toString()))violations.push({file,reason:'translation credential or API transport included in browser code'});
  }
}
await inspect('out');
if(violations.length){console.error(JSON.stringify(violations,null,2));process.exitCode=1;}
else console.log(`Public artifact audit passed for ${files} files; browser bundles contain no translation API client${secret?' and the actual build credential is absent':''}.`);
