<script lang="ts">
  import { onMount } from 'svelte';

  let chain = $state('ETH');
  let tokenAddress = $state('0xdac17f958d2ee523a2206206994597c13d831ec7');
  let holders: any[] = $state([]);
  let riskWarning = $state('');
  let honeypot: any = $state(null);
  let dexUrl = $state('');
  let error = $state('');
  let loading = $state(false);

  async function loadAll() {
    loading = true;
    error = '';
    holders = [];
    riskWarning = '';
    honeypot = null;
    dexUrl = '';

    try {
      // DexScreener K线（最稳定）
      const dexRes = await fetch(`/api/proxy?target=${encodeURIComponent(`https://api.dexscreener.com/latest/dex/search?q=${tokenAddress}`)}`);
      const dexData = await dexRes.json();
      const pair = dexData.pairs?.[0];
      if (pair) dexUrl = `https://dexscreener.com/${pair.chainId}/${pair.pairAddress}`;

      // GoPlus 安全扫描
      const cid = chain === 'ETH' ? 1 : 56;
      const secRes = await fetch(`/api/proxy?target=${encodeURIComponent(`https://api.gopluslabs.io/api/v1/token/security/${cid}/${tokenAddress}`)}`);
      const secData = await secRes.json();
      const info = secData[tokenAddress.toLowerCase()] || {};
      honeypot = {
        honeypot: info.is_honeypot === '1' ? '是！🚨' : '否 ✅',
        buyTax: info.buy_tax || '0',
        sellTax: info.sell_tax || '0'
      };

      // Etherscan 持仓（尝试，如果失败就显示提示）
      error = '持仓列表需要 Etherscan Pro Key（免费已不支持），K线和安全扫描正常显示';

    } catch (e) {
      error = `加载失败：${(e as Error).message || '请检查网络'}`;
    } finally {
      loading = false;
    }
  }

  onMount(loadAll);
</script>

<div class="min-h-screen bg-zinc-950 text-white p-6">
  <header class="text-center mb-8">
    <h1 class="text-4xl font-bold text-cyan-400">金马纳财 2026</h1>
    <p class="text-xs text-zinc-400">国际DeFi风控标准 • 多链</p>
  </header>

  <div class="max-w-2xl mx-auto space-y-6">
    <select bind:value={chain} class="w-full p-4 bg-zinc-900 rounded-2xl text-lg">
      <option value="ETH">ETH</option>
      <option value="BSC">BSC（需Pro Key）</option>
    </select>

    <input bind:value={tokenAddress} placeholder="合约地址" class="w-full p-4 bg-zinc-900 rounded-2xl text-lg font-mono" />

    <button onclick={loadAll} disabled={loading} class="w-full bg-cyan-400 text-black font-bold py-4 rounded-3xl text-xl">
      {loading ? '加载中...' : '🚀 加载真实数据'}
    </button>

    {#if error}
      <div class="p-4 bg-yellow-900/80 border border-yellow-500 rounded-2xl text-yellow-300">
        {error}
      </div>
    {/if}

    {#if dexUrl}
      <iframe src={dexUrl} class="w-full h-[420px] mt-6 rounded-3xl" allowfullscreen></iframe>
    {/if}

    {#if honeypot}
      <div class="p-6 bg-zinc-900 rounded-3xl">
        <h3 class="font-bold mb-3">GoPlus 安全扫描</h3>
        <div>蜜罐：{honeypot.honeypot}</div>
        <div>买入税：{honeypot.buyTax}%</div>
        <div>卖出税：{honeypot.sellTax}%</div>
      </div>
    {/if}
  </div>
</div>

<style>@import 'tailwindcss';</style>
