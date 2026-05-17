import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Root HTML for static web export — PWA manifest, theme, and service worker.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E31837" />
        <meta name="application-name" content="Daily Stock" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Daily Stock" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: serviceWorkerRegistration }} />
      </body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #f8f6f6;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #0f172a;
  }
}`;

const serviceWorkerRegistration = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
}`;
