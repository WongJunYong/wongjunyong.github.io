/* =========================================================
   WONG JUN YONG — INTERACTIVE PORTFOLIO (UI LOGIC)
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const isTouch = window.matchMedia('(hover: none)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- DATA ---------------- */
  const RESUME = {
    pdf: './assets/resume/Wong_Jun_Yong_Resume.pdf',
    p1: './assets/resume/Wong_Jun_Yong_Resume_page_1.png',
    p2: './assets/resume/Wong_Jun_Yong_Resume_page_2.png'
  };

  const CERTS = [
    { t: 'Champion — Capstone Showcase 2026', f: '01_Champion_Capstone_Showcase' },
    { t: 'AI Technology Excellence Award', f: '02_AI_Technology_Excellence_Award' },
    { t: 'Excellence in Integrated AI Workflow Design', f: '03_Excellence_In_Integrated_AI_Workflow_Design' },
    { t: 'Operational Advancement AI Award', f: '04_Operational_Advancement_AI_Award' },
    { t: 'Business Digital Transformation Award', f: '05_Business_Digital_Transformation_Award' },
    { t: 'Business Excellence Award', f: '06_Business_Excellence_Award' },
    { t: 'Best Speaker Award', f: '07_Best_Speaker_Award' }
  ].map(c => ({ ...c, img: `./assets/certs/${c.f}_page_1.png`, pdf: `./assets/certs/${c.f}.pdf` }));

  const PROJECTS = [
    {
      id: 'smartops', cat: 'ai', featured: true, year: '2026',
      title: 'SmartOps AI', sub: 'Governed RAG-LLM maintenance decision support & operations platform · Final Year Project',
      desc: 'End-to-end AI decision layer and operational web platform that converts unstructured hotel maintenance complaints into evidence-grounded recommendations, severity-aware governance decisions, and dispatched technician tasks. Awarded Overall Champion + 6 additional honours at the 2026 Sunway Capstone Showcase.',
      metrics: [['90.20%', 'Hit@5 (490 queries)'], ['152,837', 'complaints batch-run'], ['32/45', 'auto-released (0 critical)'], ['90 min', 'end-to-end SLA']],
      tags: ['Python', 'Llama 3.1 8B', 'ChromaDB', 'BM25 + BGE', 'Cross-Encoder', 'FastAPI', 'PHP & MySQL', 'RAGAS', 'ISO Risk Governance'],
      bullets: [
        'Architected a modular RAG-LLM pipeline: TF-IDF + Logistic Regression classifier → hybrid BGE dense + BM25 sparse retrieval with cross-encoder reranking → parent–child knowledge base (98 scenarios, 98 parent + 196 child chunks) → bounded Llama 3.1 8B Generate–Verify–Ground–Repair loop → deterministic HITL governance.',
        'Validated at scale across 152,837 batch complaints (99.3% classifier accuracy), 490 frozen synthetic queries (90.20% post-rerank Hit@5), 510 complaints (100% parent–child reconstruction), 500 confidence-gated LLM rows, RAGAS & LLM-as-judge evaluations, and a 50-case V1.2.7 acceptance run (45/45 grounded outputs, 9/9 repairs, 32/45 auto-released, and 0 critical/active-hazard auto-releases).',
        'Designed a severity-aware risk governance framework grounded in ISO 10002, ISO 41001, ISO 31000, and ISO 45001 alongside adaptive retrieval controls so high-risk or safety-critical issues require human sign-off and remain auditable.',
        'Built the operational PHP + MySQL Admin Portal and mobile-friendly Technician Web App connected to a FastAPI auto-assignment microservice supporting 25 technician accounts across 6 hotel-asset departments under a 90-minute SLA, complete with an interactive presentation demo.'
      ]
    },
    {
      id: 'erp', cat: 'business', year: '2025',
      title: 'Campbell ERP Simulation', sub: 'End-to-end business process integration',
      desc: 'Applied the ERP implementation lifecycle to a company simulation — requirements, configuration, UAT and reporting across six material flows.',
      metrics: [['6', 'material flows'], ['P2P + O2C', 'workflows'], ['Power BI', 'dashboards']],
      tags: ['ERP Lifecycle', 'P2P', 'O2C', 'UAT', 'Master Data', 'Power BI'],
      bullets: [
        'Translated procurement, sales, inventory and accounting needs into ERP process requirements and transaction scenarios.',
        'Configured and executed Procure-to-Pay and Order-to-Cash, from purchase requests to supplier payments and sales orders to customer receipts.',
        'Set up suppliers, customers, materials and accounting mappings; prepared and executed UAT scenarios per material flow.',
        'Built Power BI dashboards for procurement, sales and accounting analytics and validated cross-module transaction accuracy.'
      ]
    },
    {
      id: 'tng', cat: 'business', year: '2026',
      title: "Touch 'n Go eWallet Strategy", sub: 'Strategic management analysis · Team of 5',
      desc: "Strategic analysis of Malaysia's leading eWallet: external and internal environment, strategic challenges and recommended strategy.",
      metrics: [['5', 'frameworks applied'], ['2', 'strategies formulated']],
      tags: ["Porter's Five Forces", 'Driving Forces', 'SWOT', 'VRIO', 'Strategy'],
      bullets: [
        "Assessed the industry with Porter's Five Forces and Driving Forces (cashless policy, digitalisation, ecosystem convergence, cybersecurity).",
        'Evaluated internal capabilities with SWOT and VRIO — network effects, ecosystem integration and partnerships as sustainable advantages.',
        'Identified payment commoditisation and the profitability–risk paradox of financial-service expansion as key challenges.',
        'Recommended ecosystem-centric differentiation (AI personalisation, loyalty) and governed, selective expansion into higher-margin financial services.'
      ]
    },
    {
      id: 'scrum', cat: 'systems', year: '2025–26',
      title: 'Agile Web Application', sub: 'SCRUM-based web development',
      desc: 'Structured web application delivery through sprint planning, backlog grooming and incremental releases.',
      metrics: [['SCRUM', 'framework'], ['Sprints', 'iterative delivery']],
      tags: ['SCRUM', 'Jira', 'HTML', 'CSS', 'JavaScript', 'User Stories'],
      bullets: [
        'Translated user requirements into epics, user stories and acceptance criteria for navigation, forms and service modules.',
        'Developed and iteratively tested responsive interfaces using feedback from sprint reviews.',
        'Joined retrospectives and syncs to resolve blockers and improve estimation and delivery coordination.'
      ]
    }
  ];

  /* ---------------- LOADER ---------------- */
  document.body.classList.add('loading');
  const loaderFill = $('#loaderFill');
  let lp = 0;
  const lt = setInterval(() => { lp = Math.min(lp + Math.random() * 22, 92); loaderFill.style.width = lp + '%'; }, 120);
  const finishLoad = () => {
    clearInterval(lt); loaderFill.style.width = '100%';
    setTimeout(() => {
      $('#loader').classList.add('done');
      document.body.classList.remove('loading');
      $$('.split').forEach((s, i) => setTimeout(() => s.classList.add('in'), 150 + i * 180));
    }, 350);
  };
  window.addEventListener('load', finishLoad);
  setTimeout(() => { if (!$('#loader').classList.contains('done')) finishLoad(); }, 3500);

  /* ---------------- SPLIT TEXT ---------------- */
  $$('.split').forEach(el => {
    const txt = el.textContent;
    el.innerHTML = [...txt].map((c, i) => c === ' ' ? '<span class="ch">&nbsp;</span>' : `<span class="ch" style="transition-delay:${i * 45}ms">${c}</span>`).join('');
  });

  /* ---------------- REVEAL ---------------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  const observeReveals = () => $$('.reveal:not(.in), .tl-item:not(.in)').forEach(el => io.observe(el));

  /* ---------------- COUNTERS ---------------- */
  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, to = parseFloat(el.dataset.to), dec = parseInt(el.dataset.dec || 0, 10);
      const dur = 1800, t0 = performance.now();
      const tick = now => {
        const p = Math.min((now - t0) / dur, 1), v = to * (1 - Math.pow(1 - p, 4));
        el.textContent = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      cio.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('.count').forEach(el => cio.observe(el));

  /* ---------------- NAV ---------------- */
  const nav = $('#nav'), burger = $('#navBurger'), links = $('#navLinks');
  let lastY = 0;
  const sections = ['smartops', 'projects', 'awards', 'experience', 'skills', 'contact'].map(id => document.getElementById(id));
  const onScroll = () => {
    const y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    $('#scrollFill').style.width = (y / h * 100) + '%';
    const rail = $('#railFill'); if (rail) rail.style.height = Math.min(100, y / innerHeight * 100) + '%';
    if (!links.classList.contains('open')) nav.classList.toggle('hide', y > lastY && y > 300);
    lastY = y;
    let cur = null;
    sections.forEach(s => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = s.id; });
    $$('.nav-links a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
    // timeline fill
    const tl = $('.timeline'), fill = $('.timeline-fill');
    if (tl && fill) {
      const r = tl.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (innerHeight * 0.6 - r.top) / r.height));
      fill.style.height = (p * 100) + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('.nav-links a').forEach(a => a.addEventListener('click', () => { links.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }));

  /* ---------------- CURSOR + MAGNETIC ---------------- */
  if (!isTouch) {
    const dot = $('.cursor-dot'), ring = $('.cursor-ring');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`; });
    const loop = () => { rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16; ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener('mouseover', e => { if (e.target.closest('a, button, .proj, .cv-card, .cert.front, .scenario-option')) ring.classList.add('hover'); });
    document.addEventListener('mouseout', e => { if (e.target.closest('a, button, .proj, .cv-card, .cert.front, .scenario-option')) ring.classList.remove('hover'); });

    const bindMagnetic = () => $$('.magnetic').forEach(el => {
      if (el.dataset.mag) return; el.dataset.mag = 1;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
    bindMagnetic();
  }

  /* ---------------- 3D TILT ---------------- */
  const bindTilt = (scope = document) => {
    if (isTouch || reduceMotion) return;
    $$('.tilt, .proj', scope).forEach(el => {
      if (el.dataset.tilt) return; el.dataset.tilt = 1;
      const max = el.classList.contains('proj') ? 7 : 5;
      el.addEventListener('mouseenter', () => el.classList.add('tilting'));
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(1000px) rotateY(${(px - 0.5) * max * 2}deg) rotateX(${(0.5 - py) * max * 2}deg) translateZ(0)`;
        el.style.setProperty('--mx', px * 100 + '%'); el.style.setProperty('--my', py * 100 + '%');
      });
      el.addEventListener('mouseleave', () => {
        el.classList.remove('tilting');
        el.style.transform = '';
      });
    });
  };

  /* ---------------- CV CARD ---------------- */
  const cvCard = $('#cvCard'), cvTilt = $('#cvTilt'), cvStage = $('#cvStage');
  let flipped = false, tiltX = 0, tiltY = 0;
  const applyTilt = () => { cvTilt.style.transform = `rotateY(${tiltY}deg) rotateX(${tiltX}deg)`; };
  const setFlip = f => {
    flipped = f;
    cvCard.classList.toggle('flipped', flipped);
    $$('[data-cvpage]').forEach(b => b.classList.toggle('active', (b.dataset.cvpage === '2') === flipped));
  };
  if (!isTouch) {
    cvStage.addEventListener('mousemove', e => {
      const r = cvStage.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      tiltY = (px - 0.5) * 26; tiltX = (0.5 - py) * 18; applyTilt();
      cvCard.style.setProperty('--gx', (flipped ? (1 - px) : px) * 100 + '%');
      cvCard.style.setProperty('--gy', py * 100 + '%');
    });
    cvStage.addEventListener('mouseleave', () => { tiltX = tiltY = 0; applyTilt(); });
  } else if (window.DeviceOrientationEvent && !reduceMotion) {
    window.addEventListener('deviceorientation', e => {
      if (e.gamma == null) return;
      tiltY = Math.max(-15, Math.min(15, e.gamma * 0.5)); tiltX = Math.max(-10, Math.min(10, (e.beta - 45) * 0.3)); applyTilt();
    });
  }
  cvCard.addEventListener('click', () => setFlip(!flipped));
  cvCard.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlip(!flipped); } });
  $$('[data-cvpage]').forEach(b => b.addEventListener('click', () => setFlip(b.dataset.cvpage === '2')));
  $('#cvFull').addEventListener('click', () => openResume());

  /* ---------------- MODAL ---------------- */
  const modal = $('#modal'), mBody = $('#modalBody'), mTitle = $('#modalTitle'), mSub = $('#modalSub'), mDl = $('#mDownload');
  let modalMode = null, modalIdx = 0;
  const openModal = () => { modal.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const closeModal = () => { modal.classList.remove('open'); document.body.style.overflow = ''; };
  const navBtns = show => { $('#mPrev').style.display = $('#mNext').style.display = show ? '' : 'none'; };

  function openResume() {
    modalMode = 'cv'; mTitle.textContent = 'Wong Jun Yong — Resume'; mSub.textContent = 'Business Analytics · 2 pages';
    mDl.style.display = ''; mDl.href = RESUME.pdf; mDl.setAttribute('download', 'Wong_Jun_Yong_Resume.pdf'); navBtns(false);
    mBody.innerHTML = `<img src="${RESUME.p1}" alt="Resume page 1" /><img src="${RESUME.p2}" alt="Resume page 2" />`;
    mBody.scrollTop = 0; openModal();
  }
  function openCert(i) {
    modalMode = 'cert'; modalIdx = (i + CERTS.length) % CERTS.length; const c = CERTS[modalIdx];
    mTitle.textContent = c.t; mSub.textContent = `Sunway Capstone Showcase · 11 Aug 2026 · ${modalIdx + 1} of 7`;
    mDl.style.display = ''; mDl.href = c.pdf; mDl.setAttribute('download', c.f + '.pdf'); navBtns(true);
    mBody.innerHTML = `<img src="${c.img}" alt="${c.t}" />`; openModal();
  }
  function openProject(i) {
    modalMode = 'proj'; modalIdx = (i + PROJECTS.length) % PROJECTS.length; const p = PROJECTS[modalIdx];
    mTitle.textContent = p.title; mSub.textContent = `${p.year} · Project ${String(modalIdx + 1).padStart(2, '0')} of ${String(PROJECTS.length).padStart(2, '0')}`;
    mDl.style.display = 'none'; navBtns(true);
    mBody.innerHTML = `<div class="pd">
      <span class="proj-sub">${p.sub}</span>
      <h4>${p.title}</h4>
      <p>${p.desc}</p>
      <div class="metrics">${p.metrics.map(m => `<div><b>${m[0]}</b><span>${m[1]}</span></div>`).join('')}</div>
      <ul>${p.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
      <div class="tags">${p.tags.map(t => `<span>${t}</span>`).join('')}</div>
      ${p.id === 'smartops' ? '<a class="pd-link" href="#smartops" data-close>Try the SmartOps demo →</a>' : ''}
    </div>`;
    mBody.scrollTop = 0; openModal();
  }
  $('#mClose').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-close]')) closeModal(); });
  $('#mPrev').addEventListener('click', () => modalMode === 'cert' ? openCert(modalIdx - 1) : openProject(modalIdx - 1));
  $('#mNext').addEventListener('click', () => modalMode === 'cert' ? openCert(modalIdx + 1) : openProject(modalIdx + 1));
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (modalMode !== 'cv' && e.key === 'ArrowLeft') $('#mPrev').click();
    if (modalMode !== 'cv' && e.key === 'ArrowRight') $('#mNext').click();
  });

  /* ---------------- PROJECTS ---------------- */
  const grid = $('#projGrid');
  grid.innerHTML = PROJECTS.map((p, i) => `
    <article class="proj ${p.featured ? 'featured' : ''} reveal" data-cat="${p.cat}" data-i="${i}" tabindex="0" role="button" aria-label="Open ${p.title} details">
      <div class="proj-glow"></div>
      <div class="proj-top"><span class="proj-num">${String(i + 1).padStart(2, '0')}</span><span class="proj-year">${p.year}</span></div>
      <h3>${p.title}</h3>
      <span class="proj-sub">${p.sub}</span>
      <p class="desc">${p.desc}</p>
      <div class="tags">${p.tags.slice(0, p.featured ? 9 : 5).map(t => `<span>${t}</span>`).join('')}</div>
      <div class="metrics">${p.metrics.map(m => `<div><b>${m[0]}</b><span>${m[1]}</span></div>`).join('')}</div>
      <span class="proj-open">→</span>
    </article>`).join('');
  $$('.proj', grid).forEach(card => {
    card.addEventListener('click', () => openProject(+card.dataset.i));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(+card.dataset.i); } });
  });
  $$('#projFilters .chip').forEach(btn => btn.addEventListener('click', () => {
    $$('#projFilters .chip').forEach(b => b.classList.toggle('active', b === btn));
    const f = btn.dataset.f;
    $$('.proj', grid).forEach(card => {
      const show = f === 'all' || card.dataset.cat === f;
      card.classList.toggle('hidden', !show);
      card.classList.toggle('featured', show && f === 'all' && card.dataset.i === '0');
      if (show) card.classList.add('in');
    });
  }));

  /* ---------------- SMARTOPS USER-SIDE INTERACTIVE DEMO ---------------- */
  const ragDemo = $('#ragDemo');
  if (ragDemo) {
    const SCENARIOS = {
      plumbing: {
        roomId: '1208',
        label: 'Plumbing',
        category: 'D20 Plumbing',
        complaint: 'The hot water pressure in the shower is very low',
        confidence: '0.97',
        scenarioId: 'P-D20-001',
        issue: 'Low hot water pressure',
        cause: 'Restricted flow in the hot-water service',
        severity: 'LOW',
        severityNote: 'Routine maintenance case — safe to release automatically',
        gate1: 'Verified',
        gate1Note: 'Hotel manual evidence is complete enough to answer safely',
        gate2: 'Auto-Approved',
        gate2Note: 'Routine low-risk repair passed all validation checks',
        badgeText: 'AUTO APPROVED',
        badgeClass: 'approved',
        statusText: 'Finding the matching low hot-water-pressure scenario…',
        troubleshooting: [
          'Inspect the showerhead for mineral restriction.',
          'Confirm the hot-water isolation valve is fully open.',
          'Check pressure at the outlet and upstream line.'
        ],
        preventive: [
          'Descale shower fittings regularly.',
          'Inspect isolation valves during scheduled servicing.',
          'Record routine hot-water pressure checks.'
        ]
      },
      hvac: {
        roomId: '305',
        label: 'HVAC',
        category: 'D30 HVAC',
        complaint: 'The air conditioner is leaking water and the room is not cooling properly',
        confidence: '0.96',
        scenarioId: 'P-D30-001',
        issue: 'Air-conditioner water leakage',
        cause: 'Blocked condensate drain, dirty filter, or an iced cooling coil',
        severity: 'HIGH',
        severityNote: 'Paused for a quick safety check due to water-damage & slip risk',
        gate1: 'Verified',
        gate1Note: 'Hotel manual evidence is complete enough to answer safely',
        gate2: 'Human Review',
        gate2Note: 'High-severity issue requires supervisor confirmation before release',
        badgeText: 'HUMAN REVIEW',
        badgeClass: 'review',
        statusText: 'Finding the matching AC water-leakage scenario…',
        troubleshooting: [
          'Switch off the unit if water is near electrical components.',
          'Inspect the condensate tray and drain line.',
          'Check the air filter and look for coil icing.',
          'Test drainage and cooling performance.'
        ],
        preventive: [
          'Clean filters on schedule.',
          'Flush the condensate drain.',
          'Inspect the drain pan.',
          'Record recurring leakage or icing during preventive servicing.'
        ]
      },
      electrical: {
        roomId: '1208',
        label: 'Electrical',
        category: 'D50 Electrical',
        complaint: 'The power socket beside the bed is not working',
        confidence: '0.98',
        scenarioId: 'P-D50-001',
        issue: 'Guest-room power outlet has no supply',
        cause: 'Tripped protection device, loose connection, or failed socket',
        severity: 'MEDIUM',
        severityNote: 'Qualified electrical inspection required',
        gate1: 'Verified',
        gate1Note: 'Hotel manual evidence is complete enough to answer safely',
        gate2: 'Auto-Approved',
        gate2Note: 'Grounded electrical check steps passed validation checks',
        badgeText: 'AUTO APPROVED',
        badgeClass: 'approved',
        statusText: 'Finding the matching outlet no-power scenario…',
        troubleshooting: [
          'Advise guest to stop using the outlet immediately.',
          'Check whether nearby outlets in the room are affected.',
          'Verify the circuit breaker or RCD status.',
          'Have a qualified technician test the socket, supply, and connections.'
        ],
        preventive: [
          'Include socket condition checks in room inspections.',
          'Test protective devices periodically.',
          'Record loose, damaged, or overheating outlets for replacement.'
        ]
      }
    };

    const runBtn = $('#ragRunBtn');
    const bar = $('#ragBar');
    const statusText = $('#ragStatus');
    const roomInput = $('#roomId');
    const complaintInput = $('#complaint');
    const catStageText = $('#ragCategoryStageText');
    const scenarioBtns = $$('.scenario-option', ragDemo);
    const stages = [1, 2, 3, 4].map(n => $(`#ragStage${n}`));
    const idleBox = $('#ragResultIdle');
    const resultBody = $('#ragResultBody');

    const out = {
      caseId: $('#ragCaseId'),
      title: $('#ragResultTitle'),
      summary: $('#ragResultSummary'),
      badge: $('#ragApprovalBadge'),
      room: $('#ragResultRoom'),
      category: $('#ragResultCategory'),
      confidence: $('#ragResultConfidence'),
      scenarioId: $('#ragResultScenarioId'),
      issue: $('#ragResultIssue'),
      cause: $('#ragResultCause'),
      severity: $('#ragResultSeverity'),
      severityNote: $('#ragResultSeverityNote'),
      gate1: $('#ragResultGate1'),
      gate1Note: $('#ragResultGate1Note'),
      gate2: $('#ragResultGate2'),
      gate2Note: $('#ragResultGate2Note'),
      troubleshooting: $('#ragTroubleshooting'),
      preventive: $('#ragPreventive')
    };

    let selectedKey = 'plumbing';
    let runTimers = [];
    let isRunning = false;

    const clearRunTimers = () => {
      runTimers.forEach(clearTimeout);
      runTimers = [];
    };

    const resetStages = () => stages.forEach(s => s && s.classList.remove('active', 'done'));

    const activateStage = idx => {
      stages.forEach((s, i) => {
        if (!s) return;
        s.classList.toggle('active', i === idx);
        if (i < idx) {
          s.classList.remove('active');
          s.classList.add('done');
        }
      });
    };

    const makeCaseId = key => {
      const now = new Date();
      const pad = v => String(v).padStart(2, '0');
      return `CASE_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${key.toUpperCase()}`;
    };

    const renderList = (el, steps) => {
      if (!el) return;
      el.innerHTML = steps.map(s => `<li>${s}</li>`).join('');
    };

    const renderResult = (key, data) => {
      const chosenRoom = (roomInput.value || '').trim() || data.roomId;
      out.caseId.textContent = makeCaseId(key);
      out.title.textContent = 'Grounded Maintenance Recommendation';
      out.summary.textContent = 'Evidence-backed diagnosis, safety decision, and step-by-step guidance from hotel manuals.';
      out.badge.textContent = data.badgeText;
      out.badge.className = `pipeline-status ${data.badgeClass}`;
      out.room.textContent = chosenRoom;
      out.category.textContent = data.category;
      out.confidence.textContent = `Match certainty: ${data.confidence}`;
      out.scenarioId.textContent = data.scenarioId;
      out.issue.textContent = data.issue;
      out.cause.textContent = `Likely cause: ${data.cause}`;
      out.severity.textContent = data.severity;
      out.severityNote.textContent = data.severityNote;
      out.gate1.textContent = data.gate1;
      out.gate1Note.textContent = data.gate1Note;
      out.gate2.textContent = data.gate2;
      out.gate2Note.textContent = data.gate2Note;
      renderList(out.troubleshooting, data.troubleshooting);
      renderList(out.preventive, data.preventive);
    };

    const selectScenario = key => {
      clearRunTimers();
      isRunning = false;
      runBtn.disabled = false;
      $('span', runBtn).textContent = 'Run SmartOps';
      selectedKey = key;
      const data = SCENARIOS[key];
      roomInput.value = data.roomId;
      complaintInput.value = data.complaint;
      catStageText.textContent = `Classify into ${data.category}`;
      scenarioBtns.forEach(b => {
        const active = b.dataset.scenario === key;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      ragDemo.classList.remove('has-result');
      bar.style.width = '0%';
      resetStages();
      if (idleBox) idleBox.hidden = false;
      if (resultBody) resultBody.hidden = true;
      statusText.textContent = `${data.label} complaint selected — click Run SmartOps to begin.`;
    };

    const runDemo = () => {
      const key = selectedKey;
      const data = SCENARIOS[key];
      clearRunTimers();
      isRunning = true;
      ragDemo.classList.remove('has-result');
      if (idleBox) idleBox.hidden = false;
      if (resultBody) resultBody.hidden = true;
      resetStages();

      runBtn.disabled = true;
      $('span', runBtn).textContent = 'Running SmartOps…';
      const stepMs = reduceMotion ? 40 : 440;
      bar.style.transition = 'none';
      bar.style.width = '0%';
      void bar.offsetWidth;
      bar.style.transition = `width ${stepMs}ms cubic-bezier(0.22, 1, 0.36, 1)`;
      bar.style.width = '22%';

      activateStage(0);
      statusText.textContent = `Step 1: Identifying maintenance team (${data.category}, certainty ${data.confidence})…`;

      runTimers.push(setTimeout(() => {
        bar.style.width = '48%';
        activateStage(1);
        statusText.textContent = `Step 2: ${data.statusText}`;
      }, stepMs));

      runTimers.push(setTimeout(() => {
        bar.style.width = '74%';
        activateStage(2);
        statusText.textContent = 'Step 3: Retrieving step-by-step troubleshooting guidance…';
      }, stepMs * 2));

      runTimers.push(setTimeout(() => {
        bar.style.width = '92%';
        activateStage(3);
        statusText.textContent = 'Step 4: Retrieving preventive-maintenance steps…';
      }, stepMs * 3));

      runTimers.push(setTimeout(() => {
        bar.style.width = '100%';
        stages.forEach(s => { s.classList.remove('active'); s.classList.add('done'); });
        renderResult(key, data);
        if (idleBox) idleBox.hidden = true;
        if (resultBody) resultBody.hidden = false;
        ragDemo.classList.add('has-result');
        statusText.textContent = `Complete: ${data.category} recommendation ready for Room ${(roomInput.value || '').trim() || data.roomId}.`;
        runBtn.disabled = false;
        $('span', runBtn).textContent = 'Run SmartOps Again';
        isRunning = false;
      }, stepMs * 4));
    };

    scenarioBtns.forEach(b => b.addEventListener('click', () => selectScenario(b.dataset.scenario)));
    runBtn.addEventListener('click', runDemo);

    const ragIO = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (!isRunning && !ragDemo.classList.contains('has-result')) runDemo();
        ragIO.disconnect();
      }
    }, { threshold: 0.25 });
    ragIO.observe(ragDemo);
  }

  /* ---------------- AWARDS CAROUSEL ---------------- */
  const ring = $('#carouselRing'), carousel = $('#carousel');
  const N = CERTS.length, step = 360 / N;
  let rot = 0, current = 0;
  ring.innerHTML = CERTS.map((c, i) => `<div class="cert" data-i="${i}"><img src="${c.img}" alt="${c.t}" loading="lazy" draggable="false" /></div>`).join('');
  const certEls = $$('.cert', ring);
  const radius = () => Math.round((ring.offsetWidth / 2) / Math.tan(Math.PI / N) * 1.18);
  const layoutCarousel = () => {
    const r = radius();
    certEls.forEach((el, i) => { el.style.transform = `rotateY(${i * step}deg) translateZ(${r}px)`; });
    ring.style.transform = `translateZ(${-r}px) rotateY(${rot}deg)`;
  };
  const updateFront = () => {
    current = ((Math.round(-rot / step) % N) + N) % N;
    certEls.forEach((el, i) => el.classList.toggle('front', i === current));
    $('#carTitle').textContent = CERTS[current].t;
    $('#carTag').textContent = `${String(current + 1).padStart(2, '0')} / 07 · Click to open`;
  };
  const goTo = r => { rot = r; ring.style.transform = `translateZ(${-radius()}px) rotateY(${rot}deg)`; updateFront(); };
  $('#carPrev').addEventListener('click', () => goTo(Math.round(rot / step) * step + step));
  $('#carNext').addEventListener('click', () => goTo(Math.round(rot / step) * step - step));
  $('#carCaption')?.addEventListener('click', () => openCert(current));
  let dragging = false, carPaused = false, startX = 0, startRot = 0, moved = 0;
  carousel.addEventListener('pointerdown', e => { dragging = true; moved = 0; startX = e.clientX; startRot = rot; carousel.classList.add('dragging'); });
  window.addEventListener('pointermove', e => {
    if (!dragging) return; const dx = e.clientX - startX; moved = Math.abs(dx);
    rot = startRot + dx * 0.35; ring.style.transform = `translateZ(${-radius()}px) rotateY(${rot}deg)`; updateFront();
  });
  window.addEventListener('pointerup', e => {
    if (!dragging) return; dragging = false; carousel.classList.remove('dragging');
    if (moved < 6) {
      const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest('.cert');
      if (hit) { const i = +hit.dataset.i; if (i === current) openCert(i); else goTo(Math.round(rot / step) * step - (((i - current + N + Math.floor(N / 2)) % N) - Math.floor(N / 2)) * step); }
    } else goTo(Math.round(rot / step) * step);
  });
  setInterval(() => { if (!dragging && !carPaused && !modal.classList.contains('open') && isInView(carousel)) $('#carNext').click(); }, 4200);
  carousel.addEventListener('pointerenter', () => { carPaused = true; });
  carousel.addEventListener('pointerleave', () => { carPaused = false; });
  function isInView(el) { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }
  window.addEventListener('resize', layoutCarousel);
  layoutCarousel(); updateFront();

  /* ---------------- TIMELINE FILL ---------------- */
  const tl = $('.timeline'); if (tl) { const f = document.createElement('div'); f.className = 'timeline-fill'; tl.prepend(f); }

  /* ---------------- SKILL SPHERE ---------------- */
  const SKILLS = [
    ['Python', 'data'], ['SQL', 'data'], ['Excel', 'data'], ['Pandas', 'data'], ['NumPy', 'data'], ['Scikit-learn', 'data'], ['EDA', 'data'], ['Power BI', 'data'], ['Tableau', 'data'], ['KPI Analysis', 'data'], ['Dashboards', 'data'],
    ['RAG', 'ai'], ['LLM', 'ai'], ['Llama 3.1', 'ai'], ['BM25', 'ai'], ['ChromaDB', 'ai'], ['BGE Embeddings', 'ai'], ['Reranking', 'ai'], ['Prompt Engineering', 'ai'], ['OCR', 'ai'], ['RAGAS', 'ai'], ['Vector Search', 'ai'],
    ['FastAPI', 'sys'], ['REST APIs', 'sys'], ['MySQL', 'sys'], ['PHP', 'sys'], ['HITL', 'sys'], ['SCRUM', 'sys'], ['SDLC', 'sys'], ['BALC', 'sys'], ['Jira', 'sys'],
    ['ERP P2P', 'biz'], ['ERP O2C', 'biz'], ['UAT', 'biz'], ['Transfer Pricing', 'biz'], ['Benchmarking', 'biz'], ['SWOT / VRIO', 'biz'], ['Process Improvement', 'biz'], ['Stakeholders', 'biz']
  ];
  const sphere = $('#tagSphere');
  sphere.innerHTML = SKILLS.map(s => `<span data-g="${s[1]}">${s[0]}</span>`).join('');
  const tags = $$('span', sphere);
  const pts = tags.map((_, i) => {
    const phi = Math.acos(-1 + (2 * i + 1) / tags.length), theta = Math.sqrt(tags.length * Math.PI) * phi;
    return [Math.cos(theta) * Math.sin(phi), Math.sin(theta) * Math.sin(phi), Math.cos(phi)];
  });
  let ax = 0.0016, ay = 0.0032, sDrag = false, sx = 0, sy = 0, angX = 0, angY = 0;
  const renderSphere = () => {
    const R = sphere.offsetWidth * 0.4;
    angX += ax; angY += ay;
    const cx = Math.cos(angX), sxn = Math.sin(angX), cy = Math.cos(angY), syn = Math.sin(angY);
    tags.forEach((t, i) => {
      let [x, y, z] = pts[i];
      let y1 = y * cx - z * sxn, z1 = y * sxn + z * cx;
      let x2 = x * cy + z1 * syn, z2 = -x * syn + z1 * cy;
      const scale = (z2 + 2) / 3;
      t.style.transform = `translate(-50%,-50%) translate3d(${x2 * R}px, ${y1 * R}px, 0) scale(${scale})`;
      t.style.opacity = 0.25 + (z2 + 1) * 0.375;
      t.style.zIndex = Math.round(z2 * 100) + 100;
    });
    if (!sDrag) { ax += (0.0016 - ax) * 0.02; ay += (0.0032 - ay) * 0.02; }
    requestAnimationFrame(renderSphere);
  };
  sphere.addEventListener('pointerdown', e => { sDrag = true; sx = e.clientX; sy = e.clientY; sphere.setPointerCapture(e.pointerId); });
  sphere.addEventListener('pointermove', e => {
    if (!sDrag) return;
    ay = (e.clientX - sx) * 0.0009; ax = -(e.clientY - sy) * 0.0009; sx = e.clientX; sy = e.clientY;
  });
  sphere.addEventListener('pointerup', () => { sDrag = false; });
  renderSphere();
  let pinnedGroup = null;
  const highlight = g => { tags.forEach(t => t.classList.toggle('hl', !!(g && t.dataset.g === g))); $$('.sg').forEach(b => b.classList.toggle('active', b.dataset.g === g)); };
  $$('.sg').forEach(b => {
    b.addEventListener('mouseenter', () => highlight(b.dataset.g));
    b.addEventListener('mouseleave', () => highlight(pinnedGroup));
    b.addEventListener('click', () => {
      pinnedGroup = pinnedGroup === b.dataset.g ? null : b.dataset.g;
      highlight(pinnedGroup);
    });
  });

  /* ---------------- CONTACT ---------------- */
  const toast = msg => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600); };
  $('#copyEmail').addEventListener('click', () => {
    const email = 'wongjunyong30@gmail.com';
    (navigator.clipboard ? navigator.clipboard.writeText(email) : Promise.reject()).then(() => toast('Copied: ' + email)).catch(() => toast(email));
  });

  /* ---------------- INIT ---------------- */
  observeReveals();
  bindTilt();
  onScroll();
})();
