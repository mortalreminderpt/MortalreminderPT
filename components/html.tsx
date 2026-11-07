import parse, { attributesToProps, type Element } from 'html-react-parser';

export function assetUrl(src: string) {
  return src.replace(/^\/zh-cn\/(images|css|js)\//, '/$1/');
}

/** Rich article HTML keeps the original Kramdown and TeX layout intact. */
export function Html({ html }: { html?: string }) {
  if (!html) return null;
  return <>{parse(html.replace(/"=""/g, '"'), {
    replace(node) {
      const element = node as Element;
      if (element.type !== 'tag') return;
      if (element.name === 'script' || element.name === 'meta') return <></>;
      if (element.name === 'img') {
        const attrs = { ...element.attribs };
        if (!attrs['data-src'] && !attrs.src) return;
        for (const key of Object.keys(attrs)) if (key.startsWith('on') || !/^[\w:-]+$/.test(key)) delete attrs[key];
        if (attrs.src) attrs.src = assetUrl(attrs.src);
        if (attrs['data-src']) attrs['data-src'] = assetUrl(attrs['data-src']);
        const props = attributesToProps(attrs);
        return <img {...props} />;
      }
    },
  })}</>;
}
