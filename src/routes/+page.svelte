<script lang="ts">
  import { onMount } from 'svelte';

  let chain = $state('ETH');
  let tokenAddress = $state('0xdac17f958d2ee523a2206206994597c13d831ec7');
  let scanKey = $state('EXQI6PQQZFK1XTJN8P9GPSUWIN2DMD3R7A');
  let holders: any[] = $state([]);
  let riskWarning = $state('');
  let honeypot: any = $state(null);
  let dexUrl = $state('');
  let error = $state('');
  let loading = $state(false);

  const CONFIG = {
    ETH: { cid: 1, base: 'https://api.etherscan.io/v2/api' },
    BSC: { cid: 56, base: 'https://api.etherscan.io/v2/api' }
  };

  async function loadAll() {
    loading = true; error = '';
    try {
      await loadEVM();
      await Promise.all([fetchDex(), scanSecurity()]);
    } catch (e) {
      error = `国际标准错误：${(e as Error).message}`;
    } finally { loading = false; }
  }

  async function loadEVM() {
    const c = CONFIG[chain];
    const base = `${c.base}?chainid=${c.cid}&apikey=${scanKey}`;

    const [hRes, sRes, decRes] = await Promise.all([
      fetch(`/api/proxy?target=${encodeURIComponent(`${base}&module=token&action=tokenholderlist&contractaddress=${tokenAddress}&page=1&offset=100`)}`),
      fetch(`/api/proxy?target=${encodeURIComponent(`${base}&module=token&action=tokensupply&contractaddress=${tokenAddress}`)}`),
      fetch(`/api/proxy?target=${encodeURIComponent(`${base}&module=token&action=tokeninfo&contractaddress=${tokenAddress}`)}`)
    ]);

    const hData = await hRes.json();
    const sData = await sRes.json();
    const dData = await decRes.json();

    if (hData.status !== "1") {
      if (hData.result?.includes("Free API access is not supported")) {
        error = `🚨 ${chain}免费额度已用尽！请升级Etherscan Pro`;
        return;
      }
      throw new Error(hData.message);
    }

    const decimals = dData.status === "1" && dData.result?.[0] ? parseInt(dData.result[0].tokenDecimal) : 18;
    const supply = parseFloat(sData.result) / Math.pow(10, decimals);

    holders = (hData.result || []).map((h: any) => {
      const qty = parseFloat(h.TokenHolderQuantity) / Math.pow(10, decimals);
      return { ...h, pct: (qty / supply * 100).toFixed(2) };
    });

    const top10 = holders.slice(0,10).reduce((sum, h) => sum + parseFloat(h.pct), 0);
    riskWarning = top10 > 60 ? `🚨 前10持仓 ${top10.toFixed(1)}% —— 国际貔貅警报！` : `✅ 持仓健康（前10 ${top10.toFixed(1)}%）`;
  }

  async function fetchDex() {
    const res = await fetch(`/api/proxy?target=${encodeURIComponent(`https://api.dexscreener.com/latest/dex/search?q=${tokenAddress}`)}`);
    const data = await res.json();
    const pair = data.pairs?.[0];
    dexUrl = pair ? `https://dexscreener.com/${pair.chainId}/${pair.pairAddress}` : '';
  }

  async function scanSecurity() {
    const cid = CONFIG[chain].cid;
    const res = await fetch(`/api/proxy?target=${encodeURIComponent(`https://api.gopluslabs.io/api/v1/token/security/${cid}/${tokenAddress}`)}`);
    const d = await res.json();
    const r = d[tokenAddress.toLowerCase()] || {};
    honeypot = {
      honeypot: r.is_honeypot === '1' ? '是！🚨' : '否 ✅',
      buyTax: r.buy_tax || '0',
      sellTax: r.sell_tax || '0'
    };
  }

  onMount(() => loadAll());
</script>

<div class="min-h-screen bg-zinc-950 text-white p-6">
  <header class="text-center mb-8">
    <h1 class="text-4xl font-bold text-cyan-400">金马纳财 2026</h1>
    <p class="text-xs text-zinc-400">国际DeFi风控标准 • 多链 • PWA</p>
  </header>

  <div class="max-w-2xl mx-auto">
    <select bind:value={chain} class="w-full p-4 bg-zinc-900 rounded-2xl mb-4 text-lg">
      <option value="ETH">ETH</option>
      <option value="BSC">BSC（需Pro Key）</option>
    </select>
    <input bind:value={tokenAddress} placeholder="合约地址" class="w-full p-4 bg-zinc-900 rounded-2xl mb-4 text-lg" />
    <button onclick={loadAll} disabled={loading} class="w-full bg-cyan-400 text-black font-bold py-4 rounded-3xl text-xl">
      {loading ? '加载中...' : '🚀 加载真实数据'}
    </button>

    {#if error}<div class="mt-4 p-4 bg-red-950 text-red-400 rounded-2xl">{error}</div>{/if}
    {#if riskWarning}<div class="mt-4 p-4 bg-yellow-950 text-yellow-400 rounded-2xl font-bold">{riskWarning}</div>{/if}

    {#if holders.length}
      <div class="mt-8 overflow-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-zinc-800">
              <th class="p-3">地址</th>
              <th class="p-3">占比</th>
            </tr>
          </thead>
          <tbody>
            {#each holders as h}
              <tr class="border-t border-zinc-700">
                <td class="p-3 font-mono text-xs">{h.TokenHolderAddress.slice(0,12)}...</td>
                <td class="p-3">{h.pct}%</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

    {#if dexUrl}
      <iframe src={dexUrl} class="w-full h-[420px] mt-8 rounded-3xl" allowfullscreen></iframe>
    {/if}

    {#if honeypot}
      <div class="mt-8 p-6 bg-red-950/80 rounded-3xl border border-red-500">
        <h3 class="font-bold text-xl mb-3">GoPlus 国际安全扫描</h3>
        <div class="space-y-2 text-sm">
          <div>蜜罐：{honeypot.honeypot}</div>
          <div>买入税：{honeypot.buyTax}%　卖出税：{honeypot.sellTax}%</div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>@import 'tailwindcss';</style>
