import fs from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import { prepareTranslations } from './translate-content.mjs';

const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const branch=process.env.GITHUB_REF_NAME;
if(!process.env.GITHUB_ACTIONS||branch!=='gh-pages')throw new Error('Translation persistence must run on the production repository branch.');
git('config','user.name','github-actions[bot]');
git('config','user.email','41898282+github-actions[bot]@users.noreply.github.com');
let error;
for(let attempt=0;attempt<3;attempt++){
  try{await prepareTranslations();error=undefined;}catch(failure){error=failure;}
  git('add','--','content/i18n/posts.json','content/i18n/taxonomy.json','content/translations');
  if(spawnSync('git',['diff','--cached','--quiet']).status!==0)git('commit','--quiet','-m','Save generated content translations');
  const before=git('rev-parse','HEAD');
  git('fetch','--quiet','origin',branch);
  try{git('rebase','--quiet','origin/'+branch);}catch{throw new Error('Translation cache could not be rebased onto concurrent repository edits. No user changes were overwritten.');}
  const changed=git('rev-parse','HEAD')!==before;
  const pushed=spawnSync('git',['push','origin','HEAD:refs/heads/'+branch],{stdio:'inherit'}).status===0;
  if(pushed&&error)throw error;
  if(pushed&&!changed){
    const revision=git('rev-parse','HEAD');
    if(process.env.GITHUB_OUTPUT)await fs.appendFile(process.env.GITHUB_OUTPUT,`revision=${revision}\n`);
    console.log('Saved translation source revision: '+revision);
    process.exit(0);
  }
}
throw new Error('The repository changed during translation. Completed results were saved; rerun against the latest source.');
