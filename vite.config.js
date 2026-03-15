import { sveltekit } from '@sveltejs/kit/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    sveltekit(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '金马纳财 DeFi 分析平台 2026',
        short_name: '金马纳财',
        description: '国际标准多链实时风控 + K线 + 蜜罐检测',
        theme_color: '#0af',
        background_color: '#111',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        runtimeCaching: [{ urlPattern: /api\.(dexscreener|gopluslabs|etherscan)/, handler: 'NetworkFirst' }]
      }
    })
  ]
};
