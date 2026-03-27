<script lang="ts">
  import { onMount } from 'svelte';

  let chain = $state('ETH');
  let tokenAddress = $state('0xdac17f958d2ee523a2206206994597c13d831ec7');
  let scanKey = $state('');   // ← 这里留空，先不写死 Key
  let holders: any[] = $state([]);
  let riskWarning = $state('');
  let honeypot: any = $state(null);
  let dexUrl = $state('');
  let error = $state('');
  let loading = $state(false);

  const CONFIG = {
    ETH: { cid: 1 },
    BSC: { cid: 56 }
  };

  async function loadAll() {
    if (!tokenAddress) {
      error = '请输入合约地址';
      return;
    }

    loading = true;
    error = '';
    holders = [];
    riskWarning = '';
    honeypot = null;
    dexUrl = '';

    try {
      const cid = CONFIG[chain].cid;

      // 1. DexScreener K线（最稳定）
      const dexRes = await fetch(`/api/proxy?target=${encodeURIComponent(`https://api.dexscreener.com/latest/dex/search?q=${tokenAddress}`)}`);
      const dexData = await dexRes.json();
      const pair = dexData.pairs?.[0];
      if (pair) dexUrl = `https://dexscreener.com/${pair.chainId}/${pair.pairAddress}`;

      // 2. GoPlus 安全扫描（稳定）
      const securityRes = await fetch(`/api/proxy?target=${encodeURIComponent(`https://api.gopluslabs.io/api/v1/token/security/${cid}/${tokenAddress}`)}`);
      const securityData = await securityRes.json();
      const tokenInfo = securityData[tokenAddress.toLowerCase()] || {};
      honeypot = {
        isHoneypot: tokenInfo.is_honeypot === '1' ? '是！🚨 高风险' : '否 ✅',
        buyTax: tokenInfo.buy_tax || '未知',
        sellTax: tokenInfo.sell_tax || '未知'
      };

      // 3. 尝试 Etherscan 持仓（如果免费额度可用就显示）
      if (scanKey) {
        const base = `https://api.etherscan.io/api?module=token&action=tokenholderlist&contractaddress=${tokenAddress}&page=1&offset=50&apikey=${scanKey}`;
        const hRes = await fetch(`/api/proxy?target=${encodeURIComponent(base)}`);
        const hData = await hRes.json();

        if (hData.status === "1" && hData.result) {
          holders = hData.result;
          const top10Pct = holders.slice(0,10).reduce((sum: number, h: any) => sum + parseFloat(h.TokenHolderQuantity || 0), 0) / 100; // 简化计算
          riskWarning = top10Pct > 60 ? `🚨 前10持仓占比过高！风险较大` : `✅ 持仓分布相对健康`;
        } else if (hData.message?.includes("API Key") || hData.message?.includes("Pro")) {
          error = 'Etherscan 需要 Pro Key 才能查看持仓列表（免费已不支持）';
        }
      } else {
        error = '请在代码中填入你的 Etherscan API Key 才能显示持仓列表';
      }

    } catch (e) {
      error = `加载失败：${(e as Error).message || '请检查网络或 API Key'}`;
    } finally {
      loading = false;
    }
  }

  onMount(() => loadAll());
</script>

<div class="min-h-screen bg-zinc-950 text-white p-6">
  <header class="text-center mb-8">
    <h1 class="text-4xl font-bold text-cyan-400">金马纳财 2026</h1>
    <p class="text-xs text-zinc-400">国际DeFi风控标准 • 多链</p>
  </header>

  <div class="max-w-2xl mx-auto space-y-6">
    <select bind:value={chain} class="w-full p-4 bg-zinc-900 rounded-2xl text-lg">
      <option value="ETH">ETH 主网</option>
      <option value="BSC">BSC 链</option>
    </select>

    <input bind:value={tokenAddress} placeholder="合约地址" class="w-full p-4 bg-zinc-900 rounded-2xl text-lg font-mono" />

    <button onclick={loadAll} disabled={loading} class="w-full bg-cyan-400 text-black font-bold py-4 rounded-3xl text-xl">
      {loading ? '加载中...' : '🚀 加载完整数据'}
    </button>

    {#if error}
      <div class="p-4 bg-red-950 border border-red-500 rounded-2xl text-red-400 whitespace-pre-wrap">{error}</div>
    {/if}

    {#if riskWarning}
      <div class="p-4 bg-yellow-950 border border-yellow-500 rounded-2xl font-bold">{riskWarning}</div>
    {/if}

    {#if holders.length > 0}
      <div class="overflow-auto">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="bg-zinc-800">
              <th class="p-3 text-left">持仓地址</th>
              <th class="p-3 text-right">数量</th>
            </tr>
          </thead>
          <tbody>
            {#each holders as h}
              <tr class="border-t border-zinc-700">
                <td class="p-3 font-mono">{h.TokenHolderAddress}</td>
                <td class="p-3 text-right">{h.TokenHolderQuantity}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

    {#if dexUrl}
      <iframe src={dexUrl} class="w-full h-[420px] mt-6 rounded-3xl" allowfullscreen></iframe>
    {/if}

    {#if honeypot}
      <div class="p-6 bg-zinc-900 rounded-3xl border border-zinc-700">
        <h3 class="font-bold text-xl mb-4">GoPlus 安全扫描</h3>
        <div>蜜罐：{honeypot.isHoneypot}</div>
        <div>买入税：{honeypot.buyTax}%</div>
        <div>卖出税：{honeypot.sellTax}%</div>
      </div>
    {/if}
  </div>
</div>

<style>@import 'tailwindcss';</style>
