<script lang="ts">
  import { onMount } from 'svelte';

  let chain = $state('ETH');
  let tokenAddress = $state('0xdac17f958d2ee523a2206206994597c13d831ec7');
  let dexUrl = $state('');
  let honeypot: any = $state(null);
  let error = $state('');
  let loading = $state(false);

  async function loadAll() {
    loading = true;
    error = '';
    dexUrl = '';
    honeypot = null;

    try {
      // DexScreener K线
      const dexRes = await fetch(`/api/proxy?target=${encodeURIComponent(`https://api.dexscreener.com/latest/dex/search?q=${tokenAddress}`)}`);
      const dexData = await dexRes.json();
      const pair = dexData.pairs?.[0];
      if (pair) {
        dexUrl = `https://dexscreener.com/${pair.chainId}/${pair.pairAddress}`;
      } else {
        error = '未找到交易对（可能是新币或无流动性）';
      }

      // GoPlus 安全扫描
      const cid = chain === 'ETH' ? 1 : 56;
      const secRes = await fetch(`/api/proxy?target=${encodeURIComponent(`https://api.gopluslabs.io/api/v1/token/security/${cid}/${tokenAddress}`)}`);
      const secData = await secRes.json();
      const info = secData[tokenAddress.toLowerCase()] || {};

      honeypot = {
        honeypot: info.is_honeypot === '1' ? '是！🚨 高风险' : '否 ✅',
        buyTax: info.buy_tax || '未知',
        sellTax: info.sell_tax || '未知'
      };
    } catch (e) {
      error = '加载失败，请稍后重试或换一个地址';
    } finally {
      loading = false;
    }
  }

  onMount(loadAll);
</script>

<div class="min-h-screen bg-zinc-950 text-white p-6">
  <header class="text-center mb-8">
    <h1 class="text-4xl font-bold text-cyan-400">金马纳财 2026</h1>
    <p class="text-sm text-zinc-400">国际DeFi风控标准 • 多链</p>
  </header>

  <div class="max-w-2xl mx-auto space-y-6">
    <select bind:value={chain} class="w-full p-4 bg-zinc-900 rounded-2xl text-lg">
      <option value="ETH">ETH 主网</option>
      <option value="BSC">BSC 链</option>
    </select>

    <input 
      bind:value={tokenAddress} 
      placeholder="输入合约地址" 
      class="w-full p-4 bg-zinc-900 rounded-2xl text-lg font-mono"
    />

    <button 
      onclick={loadAll} 
      disabled={loading}
      class="w-full bg-cyan-400 text-black font-bold py-4 rounded-3xl text-xl transition-colors"
    >
      {loading ? '加载中...' : '🚀 加载真实数据'}
    </button>

    {#if error}
      <div class="p-4 bg-red-950 border border-red-500 rounded-2xl text-red-400">
        {error}
      </div>
    {/if}

    {#if dexUrl}
      <iframe src={dexUrl} class="w-full h-[460px] mt-8 rounded-3xl" allowfullscreen></iframe>
    {/if}

    {#if honeypot}
      <div class="p-6 bg-zinc-900 rounded-3xl border border-zinc-700">
        <h3 class="font-bold text-xl mb-4 text-cyan-400">GoPlus 安全扫描</h3>
        <div class="space-y-2 text-sm">
          <div>蜜罐：{honeypot.honeypot}</div>
          <div>买入税：{honeypot.buyTax}%</div>
          <div>卖出税：{honeypot.sellTax}%</div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>@import 'tailwindcss';</style>
