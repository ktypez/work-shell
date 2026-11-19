<script lang="ts">
  import { onMount } from 'svelte'
  import { Activity, ArrowLeft, ArrowRight, Bell, ChevronDown, ClipboardList, Database, ExternalLink, KeyRound, LayoutDashboard, Menu, Search, Settings, ShieldCheck, SlidersHorizontal, Truck, Users, X } from '@lucide/svelte'
  import { applications, type AppId } from './lib/apps'
  import { checkIntegrations, type IntegrationStatus } from './lib/integrations'

  let active = $state<AppId>('home')
  let mobileMenu = $state(false)
  let searchOpen = $state(false)
  let integrations: IntegrationStatus[] = $state([])
  let checking = $state(true)
  const currentApp = $derived(active === 'home' ? null : applications.find((app) => app.id === active) ?? null)
  const currentTitle = $derived(active === 'portal' ? 'IDENTITY & ACCESS' : currentApp?.name ?? 'OVERVIEW')
  const onlineCount = $derived(integrations.filter((item) => item.status === 'online').length)

  async function refreshStatus() {
    checking = true
    integrations = await checkIntegrations()
    checking = false
  }

  onMount(() => { void refreshStatus() })
  function openApp(id: AppId) { active = id; mobileMenu = false; searchOpen = false }
  function formatDate() { return new Intl.DateTimeFormat('en', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date()) }
</script>

<svelte:head>
  <title>Work Shell — MCKY Workspace</title>
  <meta name="description" content="A unified workspace for MCKY applications." />
  <meta name="theme-color" content="#9dd2f7" />
</svelte:head>

<div class="platform mcky-v6-shell">
  <header class="platform-bar">
    <button class="brand" onclick={() => openApp('home')} aria-label="Work Shell home">
      <span class="brand-mark">W<span>.</span></span>
      <span class="brand-copy"><strong>WORK SHELL</strong><small>MCKY APPLICATION PLATFORM</small></span>
    </button>
    <div class="bar-center"><span class="live-dot"></span> PERSONAL WORKSPACE <span class="bar-divider">/</span> {formatDate()}</div>
    <div class="bar-actions">
      <button class="icon-button" onclick={() => searchOpen = !searchOpen} aria-label="Search"><Search size={18}/></button>
      <button class="icon-button" aria-label="Notifications"><Bell size={18}/></button>
      <button class="profile-button" aria-label="Account and sign in" onclick={() => window.location.assign('https://me.mcky.space?from=work&redirect=' + encodeURIComponent(window.location.href))}>M</button>
    </div>
  </header>

  {#if searchOpen}
    <div class="search-panel">
      <Search size={17}/>
      <input placeholder="Search applications and workspace…" onkeydown={(e) => { if (e.key === 'Escape') searchOpen = false }} />
      <button class="icon-button small" onclick={() => searchOpen = false}><X size={15}/></button>
      <div class="search-results">
        {#each applications as app}
          <button onclick={() => openApp(app.id)}><span class="app-mini">{app.shortName.slice(0,1)}</span><span><strong>{app.name}</strong><small>{app.description}</small></span><ArrowRight size={15}/></button>
        {/each}
      </div>
    </div>
  {/if}

  <div class="workspace-frame mcky-v6-frame">
    <aside class:mobile-open={mobileMenu} class="sidebar">
      <div class="side-top">
        <div class="side-label">WORKSPACE</div>
        <button class="workspace-select"><span class="workspace-avatar">M</span><span><strong>My Workspace</strong><small>Personal</small></span><ChevronDown size={15}/></button>
      </div>
      <div class="side-label app-label">APPLICATIONS <span>02</span></div>
      <nav class="app-nav" aria-label="Applications">
        <button class:active={active === 'home'} onclick={() => openApp('home')}><LayoutDashboard size={18}/><span>Overview</span></button>
        {#each applications as app}
          <button class:active={active === app.id} onclick={() => openApp(app.id)}>
            {#if app.id === 'truck'}<Truck size={18}/>{:else if app.id === 'data'}<Database size={18}/>{/if}
            <span>{app.name}</span><span class="nav-status"></span>
          </button>
        {/each}
      </nav>
      <div class="side-bottom">
        <div class="side-label">PLATFORM</div>
        <button class:active={active === 'portal'} class="utility-link" onclick={() => openApp('portal')}><ShieldCheck size={17}/> Identity & access</button>
        <button class="utility-link"><Settings size={17}/> Settings</button>
        <div class="sidebar-foot"><span class="live-dot"></span> SYSTEMS <b>{checking ? 'CHECKING' : onlineCount + '/2 ONLINE'}</b></div>
      </div>
    </aside>

    <main class="main-area">
      <div class="mobile-appbar">
        <button class="icon-button" onclick={() => mobileMenu = !mobileMenu}><Menu size={19}/></button>
        <span>{currentTitle}</span>
        <button class="icon-button" onclick={() => searchOpen = true}><Search size={18}/></button>
      </div>
      <div class="content-wrap">
        {#if active === 'home'}
          <div class="page-topline"><span>WORKSPACE / OVERVIEW</span><span>{formatDate()}</span></div>
          <section class="hero">
            <div class="hero-copy">
              <div class="eyebrow"><span class="eyebrow-dot"></span> YOUR DIGITAL WORKSPACE</div>
              <h1>Everything<br/>in <span>one place.</span></h1>
              <p>One environment for the tools you use every day. Each application keeps its own workflow, connected through one shared workspace.</p>
              <button class="primary-button mcky-v6-button" onclick={() => openApp('truck')}>OPEN WORKSPACE <ArrowRight size={16}/></button>
            </div>
            <div class="hero-art">
              <div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
              <div class="orbit-core"><span>W.</span><small>WORK<br/>SHELL</small></div>
              <div class="orbit-node node-truck"><Truck size={20}/><small>TRUCK</small></div>
              <div class="orbit-node node-data"><Database size={20}/><small>DATA</small></div>
              <div class="orbit-node node-portal"><ShieldCheck size={20}/><small>IDENTITY</small></div>
              <div class="art-spark spark-a">✳</div><div class="art-spark spark-b">✦</div>
            </div>
          </section>

          <section class="section-block">
            <div class="section-heading"><div><div class="eyebrow">YOUR APPLICATIONS</div><h2>Pick up where you left off.</h2></div><span class="section-count">02 APPS</span></div>
            <div class="app-grid">
              {#each applications as app, i}
                <button class="app-card mcky-v6-card" onclick={() => openApp(app.id)}>
                  <div class="app-card-top"><span class="app-symbol" class:yellow={app.accent === 'yellow'} class:blue={app.accent === 'blue'}>{#if app.id === 'truck'}<Truck size={22}/>{:else if app.id === 'data'}<Database size={22}/>{/if}</span><span class="app-index">0{i + 1}</span></div>
                  <div class="app-card-name">{app.name}</div>
                  <p>{app.description}</p>
                  <div class="app-card-bottom"><span><i class="status-dot"></i> CONNECTED</span><span class="card-arrow">↗</span></div>
                </button>
              {/each}
            </div>
          </section>

          <section class="section-block lower-grid">
            <div class="integration-panel">
              <div class="section-heading compact"><div><div class="eyebrow">SYSTEM HEALTH</div><h2>Connected services</h2></div><button class="text-button" onclick={refreshStatus}>REFRESH <Activity size={14}/></button></div>
              {#each integrations as item}
                <div class="integration-row">
                  <span class="integration-icon">{#if item.id === 'truck'}<Truck size={17}/>{:else if item.id === 'data'}<Database size={17}/>{:else}<ShieldCheck size={17}/>{/if}</span>
                  <span class="integration-info"><strong>{item.label}</strong><small>{item.detail}</small></span>
                  <span class="integration-state" class:online={item.status === 'online'} class:pending={item.status === 'not-configured'}>{item.status === 'online' ? 'ONLINE' : item.status === 'not-configured' ? 'SETUP' : checking ? 'CHECKING' : 'OFFLINE'}</span>
                </div>
              {/each}
            </div>
            <div class="note-panel">
              <div class="eyebrow">PLATFORM NOTE</div>
              <h3>One identity.<br/>Independent systems.</h3>
              <p>Work Shell connects to each application's existing API and database. Data stays with its source application.</p>
              <div class="note-stamp">MCKY / WORKSPACE</div>
            </div>
          </section>
        {:else if active === 'truck'}
          {@render ModuleHeader('OPERATIONS / TRUCK', 'TRUCK', 'Fleet, shifts and income operations.', 'truck', () => openApp('home'))}
          <div class="module-banner blue-banner"><div><div class="eyebrow">APPLICATION MODULE</div><h2>Transport operations.</h2><p>Continue in the TRUCK workspace with its existing workflows and records.</p></div><Truck size={58}/></div>
          {@render ModuleStats([['API CONNECTION', integrations.find(x => x.id === 'truck')?.status === 'online' ? 'ONLINE' : 'PENDING','Existing Elysia API'],['DATA SOURCE','SUPABASE','Existing PostgreSQL database'],['IDENTITY','PLATFORM','Central account service']])}
          {@render ModuleContent('TRUCK application workspace', 'The next integration step is to map the current TRUCK routes and data contracts into this module. Existing business rules and permissions remain authoritative.', 'https://truck.mcky.space')}
        {:else if active === 'data'}
          {@render ModuleHeader('INFORMATION / DATA LEDGER', 'DATA LEDGER', 'Client records, catalog and location data.', 'data', () => openApp('home'))}
          <div class="module-banner yellow-banner"><div><div class="eyebrow">APPLICATION MODULE</div><h2>Your data, organized.</h2><p>Client catalog, record details, maps and media workflows.</p></div><Database size={58}/></div>
          {@render ModuleStats([['API CONNECTION', integrations.find(x => x.id === 'data')?.status === 'online' ? 'ONLINE' : 'PENDING','Health endpoint only'],['DATA SOURCE','CLOUDFLARE D1','R2 object storage'],['ACCESS CONTROL','PORTAL','App grant required']])}
          {@render ModuleContent('DATA LEDGER application workspace', 'Client records and write operations remain hidden in this public prototype. They will be enabled after PORTAL sessions and per-app permissions are enforced by the existing API.', 'https://data.mcky.space')}
        {:else}
          {@render ModuleHeader('PLATFORM / IDENTITY', 'IDENTITY CENTER', 'Central identity, app permissions and platform administration.', 'identity', () => openApp('home'))}
          <div class="module-banner cream-banner"><div><div class="eyebrow">PLATFORM CONTROL PLANE</div><h2>One identity. Every app.</h2><p>PORTAL becomes the identity provider and administration center for Work Shell and its connected applications.</p></div><ShieldCheck size={58}/></div>
          <div class="identity-status"><span class="status-dot"></span><div><strong>IDENTITY MIGRATION IN PROGRESS</strong><small>Existing Clerk sign-in remains untouched until the new provider passes migration checks.</small></div><span class="integration-state pending">PLANNED</span></div>
          <div class="identity-admin-grid">
            <div class="identity-admin-card"><span class="identity-admin-icon"><Users size={21}/></span><div class="eyebrow">01 / ACCOUNTS</div><h3>People & identities</h3><p>Manage platform accounts, profile data, linked LINE identities, account status and sessions.</p><span class="identity-feature">Email · Password · LINE</span></div>
            <div class="identity-admin-card"><span class="identity-admin-icon"><KeyRound size={21}/></span><div class="eyebrow">02 / AUTHORIZATION</div><h3>App permissions</h3><p>Grant or revoke access by user, application and role. Keep platform administrators separate from app administrators.</p><span class="identity-feature">Platform roles · App roles</span></div>
            <div class="identity-admin-card"><span class="identity-admin-icon"><SlidersHorizontal size={21}/></span><div class="eyebrow">03 / CONFIGURATION</div><h3>Application settings</h3><p>Configure each app's registered domain, redirect allowlist, feature flags and non-secret settings.</p><span class="identity-feature">App registry · Policies</span></div>
            <div class="identity-admin-card"><span class="identity-admin-icon"><ClipboardList size={21}/></span><div class="eyebrow">04 / GOVERNANCE</div><h3>Audit & sessions</h3><p>Review sign-ins, LINE linking and sync events, permission changes, session revocations and admin actions.</p><span class="identity-feature">Audit trail · Session control</span></div>
          </div>
          <section class="identity-line-panel"><div><div class="eyebrow">IDENTITY PROVIDER</div><h3>LINE Login, directly connected</h3><p>LINE sign-in resolves existing linked accounts. Users link or reconnect from the account page; profile sync stays explicit. New accounts remain invite-only.</p></div><span class="line-mark">LINE</span></section>
          <a class="primary-button mcky-v6-button portal-open-button" href="https://me.mcky.space?from=work" target="_blank" rel="noreferrer">OPEN PORTAL ACCOUNT CENTER <ExternalLink size={15}/></a>
          <div class="identity-footer-note">PORTAL / ME.MCKY.SPACE · IDENTITY SERVICE · ADMIN CONSOLE</div>
        {/if}
        <footer class="page-footer"><span><i class="live-dot"></i> WORK SHELL / PROTOTYPE</span><span>BUILD 0.1.0 · MCKY</span></footer>
      </div>
    </main>
  </div>
  {#if mobileMenu}<button class="scrim" onclick={() => mobileMenu = false} aria-label="Close menu"></button>{/if}
</div>

{#snippet ModuleHeader(eyebrow: string, title: string, subtitle: string, icon: string, onHome: () => void)}
  <div class="page-topline"><span>{eyebrow}</span><button class="back-link" onclick={onHome}><ArrowLeft size={14}/> WORKSPACE</button></div>
  <div class="module-title"><div><div class="eyebrow">APPLICATION WORKSPACE</div><h1>{title}</h1><p>{subtitle}</p></div><span class="module-mark">{#if icon === 'truck'}<Truck size={30}/>{:else if icon === 'data'}<Database size={30}/>{:else}<ShieldCheck size={30}/>{/if}</span></div>
{/snippet}

{#snippet ModuleStats(items: [string,string,string][])}
  <div class="module-grid">{#each items as item}<div class="metric-card"><span>{item[0]}</span><strong>{item[1]}</strong><small>{item[2]}</small></div>{/each}</div>
{/snippet}

{#snippet ModuleContent(title: string, text: string, href: string)}
  <div class="module-content"><div class="eyebrow">WORKSPACE PREVIEW</div><h3>{title}</h3><p>{text}</p><a class="primary-button mcky-v6-button" href={href} target="_blank" rel="noreferrer">OPEN EXISTING APP <ExternalLink size={15}/></a></div>
{/snippet}