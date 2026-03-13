# 金马纳财 DeFi 分析平台 2026

**国际标准多链实时风控 + K线分析平台**  
链上数据秒级更新 • iPhone PWA 原生体验 • 2026 年最新技术栈

![GitHub](https://img.shields.io/badge/SvelteKit-FF3E00?logo=svelte&logoColor=white)
![GitHub](https://img.shields.io/badge/Cloudflare-Pages-000000?logo=cloudflare)
![GitHub](https://img.shields.io/badge/PWA-Ready-5A0FC8)

## ✨ 核心功能
- 多链实时行情（Solana / Ethereum / Base / BSC 等）
- 智能风控预警（大户异动、鲸鱼跟踪、 rug 风险秒级推送）
- 专业 K线 + 链上数据叠加（成交量、持仓、流动性池）
- iPhone 主屏幕一键安装 PWA（支持离线查看、自动更新）
- 极致轻量，加载 < 1 秒

## 技术栈（2026 最新）
- **前端**：SvelteKit 5 + Vite 6
- **PWA**：vite-plugin-pwa（autoUpdate + maskable icons）
- **部署**：Cloudflare Pages（全球边缘 0ms 延迟）
- **链上数据**：DexScreener / Birdeye / Pump.fun API（实时）
- **图标**：192×192 & 512×512（已适配 iOS 18+）

## 快速开始（本地开发）
```bash
git clone [https://github.com/你的用户名/jinmana-cai-2026.git](https://github.com/%E4%BD%A0%E7%9A%84%E7%94%A8%E6%88%B7%E5%90%8D/jinmana-cai-2026.git)
cd jinmana-cai-2026
npm install
npm run dev
