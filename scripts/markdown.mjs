import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import attrs from 'markdown-it-attrs';
import texmath from 'markdown-it-texmath';
import katex from 'katex';
import { load } from 'cheerio';
import { escape, prefixFor } from './i18n-core.mjs';

const headingSlug=text=>text.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu,'').replace(/\s+/g,'-');
const markdown=new MarkdownIt({html:true,linkify:true,breaks:false}).use(anchor,{slugify:headingSlug}).use(attrs).use(texmath,{engine:katex,delimiters:'dollars',katexOptions:{throwOnError:false}});
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
