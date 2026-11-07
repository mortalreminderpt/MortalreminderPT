import type { Metadata } from 'next';
import '@/styles/main.scss';
import '@/styles/next.scss';

export const metadata: Metadata = {
  title: "PT's Blog",
  icons: { icon: '/images/favicon.ico' },
  alternates: { types: { 'application/rss+xml': '/feed.xml' } },
};

const initialTheme = `(function(){var t;try{t=sessionStorage.getItem('theme')}catch(e){}if(t!=='day'&&t!=='night'){if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){t='night'}else{var h=new Date().getHours();t=h<6||h>=18?'night':'day'}}document.documentElement.dataset.theme=t})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning>
    <head>
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,500&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      <script dangerouslySetInnerHTML={{ __html: initialTheme }} />
    </head>
    <body suppressHydrationWarning>{children}</body>
  </html>;
}
