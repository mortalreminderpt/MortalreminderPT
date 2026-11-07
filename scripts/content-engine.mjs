import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import matter from 'gray-matter';
import { load } from 'cheerio';

const escape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const digest = text => crypto.createHash('sha256').update(text).digest('hex');
const prefixFor = lang => lang === 'zh-cn' ? '/zh-cn' : '';
const slug = text => String(text).toLowerCase().replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, '');
const readJson = async p => JSON.parse(await fs.readFile(p, 'utf8'));
const dateText = date => new Intl.DateTimeFormat('en-US', { timeZone: 'Australia/Melbourne', year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date));
async function filesUnder(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? filesUnder(path.join(dir, e.name)) : [path.join(dir, e.name)]))).flat();
}

export function makeCard(post, site, mode = 'normal') {
  const prefix = prefixFor(post.lang);
  const words = load(post.contentHtml).text().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.floor(words / 180));
  const reading = post.lang === 'zh-cn' ? `阅读时间 ${minutes} 分钟` : `${minutes} min read`;
  const time = `<time class="article__date" datetime="${post.date}">${dateText(post.date)}</time>`;
  return {
    className: mode === 'featured' ? 'article col col-4 col-d-6 col-t-12 animate' : 'article col col-4 col-d-6 col-t-12 grid__post animate',
    image: post.image ? { href: post.route, src: post.image, alt: post.postTitle } : null,
    featured: mode === 'featured',
    metaHtml: mode === 'featured' ? `<span class="article__minutes">${reading}</span>\n${time}` : `<span class="article__minutes">${reading}\n${time}</span>`,
    titleHtml: mode === 'featured' ? `<a href="${encodeURI(post.route)}">${escape(post.postTitle)}</a>` : escape(post.postTitle),
    title: post.postTitle,
    excerptHtml: escape(post.description),
    bottomHtml: `<div class="article__author"><a href="${prefix}/about/" aria-label="${escape(site.author.name)}"><img class="article__author-image lazy" data-src="${escape(site.author.avatar)}" alt="${escape(site.author.name)}'s Picture"></a></div>\n<div class="article__bottom-meta"><a href="${prefix}/about/" class="article__author-link">${escape(site.author.name)}</a>${post.tags?.length ? '\n<span>in</span>\n<span class="article-tags">' + post.tags.map(tag => `<a class="article__tag" href="${prefix}/tags/${encodeURIComponent(slug(tag))}">${escape(tag)}</a>`).join('\n') + '</span>' : ''}</div>`,
  };
}

export function cardHtml(card) {
  return `<div class="${card.className}"><div class="article__inner">${card.featured ? '<span class="featured-post ion ion-ios-star-outline"></span>' : ''}${card.image ? `<a class="article__image" href="${encodeURI(card.image.href)}"><img class="lazy" data-src="${escape(card.image.src)}" alt="${escape(card.image.alt)}"></a>` : ''}<div class="article__content"><div class="article__meta">${card.metaHtml}</div><h2 class="article__title">${card.titleHtml}</h2><p class="article__excerpt">${card.excerptHtml}</p><div class="article__bottom">${card.bottomHtml}</div></div></div></div>`;
}

export async function deriveAuthoredPages(pages, compile) {
  const { site, translations } = await readJson('content/site.json');
  const known = new Map(pages.filter(p => p.source).map(p => [p.source, p]));
  const edited = new Set(pages.filter(p => p._edited).map(p => p.route));
  const originalCards = new Map();
  for (const page of pages.filter(p => p.kind === 'blog')) for (const card of page.cards) if (card.image) originalCards.set(decodeURI(card.image.href), card);
  for (const file of (await filesUnder('content/posts')).filter(p => p.endsWith('.md'))) {
    const existing = known.get(file);
    if (existing && !existing._edited) continue;
    const raw = await fs.readFile(file, 'utf8');
    const { data, content } = matter(raw);
    const lang = file.split(path.sep)[2];
    if (!['en', 'zh-cn'].includes(lang)) throw new Error('Unknown article language: ' + file);
    const prefix = prefixFor(lang);
    const date = new Date(data.date || path.basename(file).slice(0, 10));
    if (Number.isNaN(date.getTime())) throw new Error('Invalid article date: ' + file);
    const categories = Array.isArray(data.category) ? data.category : data.category ? [data.category] : Array.isArray(data.categories) ? data.categories : [];
    let route = existing?.route;
    if (!route) {
      const dateParts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Melbourne', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
      const part = type => dateParts.find(p => p.type === type).value;
      const basename = path.basename(file, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, '');
      route = data.permalink || `${prefix}/${categories.length ? categories.map(c => String(c).toLowerCase()).join('/') + '/' : ''}${part('year')}/${part('month')}/${part('day')}/${basename}/`;
      if (!route.startsWith('/')) route = '/' + route;
      if (lang === 'zh-cn' && !route.startsWith('/zh-cn/')) route = '/zh-cn' + route;
      if (!route.endsWith('/')) route += '/';
      route = decodeURI(route);
      if (pages.some(p => decodeURI(p.route) === decodeURI(route))) throw new Error('Duplicate article URL: ' + route);
    }
    const template = structuredClone(existing || pages.find(p => p.kind === 'post' && p.lang === lang));
    const post = Object.assign(template, {
      route, lang, kind: 'post', title: String(data.title || path.basename(file, '.md')), postTitle: String(data.title || path.basename(file, '.md')),
      description: String(data.description || ''), source: file, sourceDigest: digest(raw), date: date.toISOString(), dateText: dateText(date),
      tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [], categories,
      image: String(data.image || ''), featured: data.featured === true, contentHtml: compile(content, lang),
    });
    if (/\bkatex\b/.test(post.contentHtml)) post.contentHtml = '<link rel="stylesheet" href="/css/katex.min.css">' + post.contentHtml;
    const hero = load(post.heroHtml, {}, false);
    hero('.post__title').text(post.postTitle);
    hero('.post__date').attr('datetime', post.date).text(post.dateText);
    hero('.post__minutes').html(`${Math.max(1, Math.floor(load(post.contentHtml).text().split(/\s+/).length / 180))} min read\n<time class="post__date" datetime="${post.date}">${post.dateText}</time>`);
    hero('.hero__image img').attr('data-src', post.image || site.hero.image).attr('alt', post.postTitle);
    if (post.image) hero('.post-image').attr('data-src', post.image).attr('alt', post.postTitle);
    else hero('.image-box').parent().remove();
    hero('.post-tags').html(post.tags.map(tag => `<a class="post__tag" href="${prefix}/tags/${encodeURIComponent(slug(tag))}">${escape(tag)}</a>`).join('\n'));
    post.heroHtml = hero.html();
    delete post._edited;
    if (existing) Object.assign(existing, post); else pages.push(post);
    edited.add(route);
  }
  if (!edited.size) return { pages, edited, shared: {} };
  const shared = {};
  for (const lang of ['en', 'zh-cn']) {
    const prefix = prefixFor(lang);
    const posts = pages.filter(p => p.kind === 'post' && p.lang === lang).sort((a, b) => new Date(b.date) - new Date(a.date));
    if (!posts.some(p => edited.has(p.route))) continue;
    const cards = new Map(posts.map(post => [post.route, edited.has(post.route) || !originalCards.has(decodeURI(post.route)) ? makeCard(post, site) : originalCards.get(decodeURI(post.route))]));
    const getCard = post => cards.get(post.route);
    const blogTemplate = pages.find(p => p.route === prefix + '/blogs/');
    const totalPages = Math.ceil(posts.length / 8);
    const featured = posts.filter(p => p.featured).map(p => {
      if (!edited.has(p.route)) {
        const old = blogTemplate.featuredCards.find(c => c.image && decodeURI(c.image.href) === decodeURI(p.route));
        if (old) return old;
      }
      return makeCard(p, site, 'featured');
    });
    for (let i = 1; i <= totalPages; i++) {
      const route = prefix + '/blogs/' + (i === 1 ? '' : i + '/');
      let page = pages.find(p => p.route === route);
      if (!page) { page = { ...structuredClone(blogTemplate), route }; pages.push(page); }
      Object.assign(page, { cards: posts.slice((i - 1) * 8, i * 8).map(getCard), pageNumber: i, totalPages, featuredCards: featured });
    }
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const navigation = (p, direction) => p ? `<a class="${direction}" href="${encodeURI(p.route)}"><img class="post__nav-image lazy" data-src="${escape(p.image)}" alt="${escape(p.postTitle)}"><div class="post__nav-box"><div class="post__nav post__nav__${direction}">${direction === 'prev' ? '<i class="ion ion-md-arrow-round-back"></i> ' + translations[lang].pages['previous-post'] : translations[lang].pages['next-post'] + ' <i class="ion ion-md-arrow-round-forward"></i>'}</div><h4 class="post__nav__title">${escape(p.postTitle)}</h4></div></a>` : '';
      post.navigationHtml = `<div class="post__navigation">${navigation(posts[i + 1], 'prev')}${navigation(posts[i - 1], 'next')}</div>`;
      const related = posts.filter(other => other !== post && other.tags.some(t => post.tags.includes(t))).slice(0, 3);
      post.relatedClass = 'related-posts' + (related.length ? ' is-related' : '');
      post.relatedCards = related.map(p => ({ ...getCard(p), className: 'article col col-4 col-d-6 col-t-12 grid__post' }));
    }
    for (const [type, property] of [['tags', 'tags'], ['categories', 'categories']]) {
      const index = pages.find(p => p.route === `${prefix}/${type}/`);
      const names = [...new Set([...index.cards.map(c => c.title), ...posts.flatMap(p => p[property])])];
      const archiveTemplate = pages.find(p => p.kind === 'archive' && p.lang === lang && p.route.startsWith(`${prefix}/${type}/`));
      index.cards = names.map(name => {
        const members = posts.filter(p => p[property].includes(name));
        const route = `${prefix}/${type}/${slug(name)}/`;
        let archive = pages.find(p => decodeURI(p.route) === decodeURI(route));
        if (!archive) { archive = { ...structuredClone(archiveTemplate), route, title: name }; pages.push(archive); }
        archive.cards = members.map(getCard);
        const hero = load(archive.heroHtml, {}, false);
        hero('.archive-title').text(name); hero('.archive-meta').text(`${members.length} ${members.length < 2 ? 'post' : 'posts'} found.`); hero('.hero__image img').attr('alt', name);
        archive.heroHtml = hero.html();
        let card = structuredClone(index.cards.find(c => c.title === name));
        if (!card) {
          const representative = members.at(-1);
          card = makeCard(representative, site);
          card.className = 'article col col-4 col-d-6 col-t-12 animate';
          card.featured = false; card.title = name; card.titleHtml = `<a href="${route}">${escape(name)}</a>`;
          if (card.image) card.image.href = route;
        }
        const meta = load(card.metaHtml, {}, false);
        meta('.article__minutes').text(`${members.length} ${translations[lang].global['post-found']}`);
        card.metaHtml = meta.html();
        return card;
      });
    }
    const fragments = await readJson(`content/shared-${lang}.json`);
    const $ = load(fragments.footerWidgetsHtml, {}, false);
    const recentTemplate = $('.recent-posts').first().clone();
    $('.recent-posts').remove();
    for (const post of posts.slice(0, 2)) {
      const recent = recentTemplate.clone();
      recent.find('.recent-posts__image').attr('href', post.route).find('img').attr('data-src', post.image).attr('alt', post.postTitle);
      recent.find('.recent-posts__title a').attr('href', post.route).text(post.postTitle);
      recent.find('.article__meta').html(getCard(post).metaHtml);
      $('.widget-recent').append(recent);
    }
    $('.widget-tag-cloud').each((i, widget) => {
      const type = i === 0 ? 'categories' : 'tags';
      const index = pages.find(p => p.route === `${prefix}/${type}/`);
      $(widget).find('.tag__cloud').html(index.cards.map(card => `<a href="${prefix}/${type}/${encodeURIComponent(slug(card.title))}">${escape(card.title)}</a>`).join('\n'));
    });
    fragments.footerWidgetsHtml = $.html();
    shared[lang] = fragments;
  }
  return { pages, edited, shared };
}
