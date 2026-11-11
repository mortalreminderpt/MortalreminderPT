import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import attrs from 'markdown-it-attrs';
import texmath from 'markdown-it-texmath';
import katex from 'katex';
import { load } from 'cheerio';
import { escape, prefixFor } from './i18n-core.mjs';

const headingSlug=text=>text.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu,'').replace(/\s+/g,'-');
// Older articles allow spaces and line breaks inside single-dollar formulas.
// Keep this in the inline parser so code, links and Markdown escaping stay intact.
const compatibleMath=/\$((?:\\[\s\S]|[^$\\])+?)\$/gy;
function compatibleDollars(md){
  md.inline.ruler.at('math_inline',(state,silent)=>{
    const start=state.pos;
    if(state.src[start]!=='$'||state.src[start+1]==='$'||!texmath.$_pre(state.src,false,start))return false;
    compatibleMath.lastIndex=start;
    const match=compatibleMath.exec(state.src);if(!match||compatibleMath.lastIndex>state.posMax)return false;
    const end=compatibleMath.lastIndex;
    if(!silent){
      // Consume rejected pairs literally, including their closing dollar, so
      // "$5 and $10" cannot reopen math at the second price or a later URL.
      if(!match[1].trim()||!texmath.$_post(state.src,false,end-1))state.pending+=match[0];
      else {const token=state.push('math_inline','math',0);token.content=match[1].trim();token.markup='$';}
    }
    state.pos=end;return true;
  });
  md.renderer.rules.math_inline=(tokens,index)=>`<eq>${katex.renderToString(tokens[index].content,{throwOnError:false})}</eq>`;
}
const markdown=new MarkdownIt({html:true,linkify:true,breaks:false}).use(anchor,{slugify:headingSlug}).use(attrs).use(texmath,{engine:katex,delimiters:'dollars',katexOptions:{throwOnError:false}}).use(compatibleDollars);

export function hasUnrenderedMath(html){
  const $=load(html,{},false);$('pre,code,math,svg,script,style,textarea,include,.katex').remove();
  const text=$.text();
  return [...text.matchAll(new RegExp(compatibleMath.source,'g'))].some(match=>match[1].trim()&&texmath.$_pre(text,false,match.index)&&texmath.$_post(text,false,match.index+match[0].length-1));
}

function proseWithoutMath(html){
  const $=load(html,{},false);$('.katex,include,math').remove();
  return $.text().replace(/\${1,2}(?:\\[\s\S]|[^$\\])*?\${1,2}/g,'').replace(/\s+/g,' ').trim();
}
function preservesWords(previous,current){
  const words=current.split(/\s+/);let index=0;
  for(const word of previous.split(/\s+/).filter(Boolean)){
    while(index<words.length&&words[index]!==word)index++;
    if(index===words.length)return false;index++;
  }
  return true;
}
export function repairCachedMath(html,render){
  if(!hasUnrenderedMath(html))return html;
  const $=load(html,{},false),fresh=load(render(),{},false),used=new Set();
  for(const element of $.root().children().toArray()){
    if(!hasUnrenderedMath($.html(element)))continue;
    const oldText=proseWithoutMath($.html(element));
    // Broken legacy formulas sometimes swallowed prose into MathML includes.
    // Match the source block without losing any surviving prose; restore only
    // that block, retaining the original TOC, anchors and surrounding markup.
    const candidates=fresh.root().children(element.tagName).toArray().filter(candidate=>!used.has(candidate)&&fresh(candidate).find('.katex').length&&preservesWords(oldText,proseWithoutMath(fresh.html(candidate))));
    const exact=candidates.filter(candidate=>proseWithoutMath(fresh.html(candidate))===oldText);
    const matches=exact.length?exact:candidates;
    if(matches.length!==1)throw new Error('Cannot safely match a cached formula block to its Markdown source.');
    used.add(matches[0]);$(element).replaceWith(fresh.html(matches[0]));
  }
  const result=$.html();
  if(hasUnrenderedMath(result))throw new Error('A cached formula is still unrendered after repair.');
  return '<link rel="stylesheet" href="/css/katex.min.css">'+result;
}
export function compile(source,lang){
  const toc=/^.*\n\{:toc\}\s*$/m.test(source);
  const text=source.replace(/^.*\n\{:toc\}\s*$/m,'\n<!-- table-of-contents -->\n')
    .replace(/\{%\s*(?:end)?raw\s*%\}/g,'')
    .replace(/\{%\s*highlight\s+(\w+)[^]*?%\}/g,'\n```$1\n').replace(/\{%\s*endhighlight\s*%\}/g,'\n```\n')
    .replace(/\{\{\s*site\.baseurl_root\s*\}\}/g,'').replace(/\{\{\s*site\.baseurl\s*\}\}/g,prefixFor(lang));
  let html=markdown.render(text);
  if(toc){
    const $=load(html,{},false);const headings=$('h1,h2,h3,h4,h5,h6').toArray();
    const root={level:0,children:[]},stack=[root];
    for(const heading of headings){
      const level=Number(heading.tagName.slice(1));
      while(stack.at(-1).level>=level)stack.pop();
      const node={level,id:$(heading).attr('id'),html:$(heading).html(),children:[]};
      stack.at(-1).children.push(node);stack.push(node);
    }
    const render=nodes=>nodes.map(node=>`<li><a href="#${escape(node.id)}" id="markdown-toc-${escape(node.id)}">${node.html}</a>${node.children.length?'<ol>'+render(node.children)+'</ol>':''}</li>`).join('');
    html=html.replace('<!-- table-of-contents -->',`<ol id="markdown-toc">${render(root.children)}</ol>`);
  }
  if(/\bkatex\b/.test(html))html='<link rel="stylesheet" href="/css/katex.min.css">'+html;
  return html;
}
