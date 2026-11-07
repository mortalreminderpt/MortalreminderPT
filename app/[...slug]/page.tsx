import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRoutes, getPage } from '@/lib/content';
import { PageRenderer } from '@/components/page-renderer';
import { siteOrigin } from '@/lib/site-origin';

export const dynamicParams = false;
export function generateStaticParams() {
  return getRoutes().filter(p => p.route !== '/' && p.route !== '/404.html').map(p => ({ slug: decodeURI(p.route).replace(/\.html$/, '').replace(/^\/|\/$/g, '').split('/') }));
}

type Props = { params: Promise<{ slug: string[] }> };
async function currentPage({ params }: Props) {
  const { slug } = await params;
  const route = '/' + slug.join('/');
  return getPage(route) || getPage(route + '.html');
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const page = await currentPage(props);
  if (!page) return {};
  return { title: page.title, description: page.description || undefined, alternates: { canonical: siteOrigin + page.route } };
}
export default async function RoutedPage(props: Props) {
  const page = await currentPage(props);
  if (!page) notFound();
  return <PageRenderer page={page} />;
}
