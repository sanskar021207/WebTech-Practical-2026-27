/* ============================================================
   NEXUS//ARCADE — Dashboard JS
   ============================================================ */

(() => {
  // ---- DOM refs ----
  const statValues     = document.querySelectorAll('.stat-value[data-count]');
  const navItems       = document.querySelectorAll('.nav-item');
  const filterTabs     = document.querySelectorAll('.ftab');
  const gameCards      = document.querySelectorAll('.game-card');
  const playBtns       = document.querySelectorAll('.g-btn');
  const favBtns        = document.querySelectorAll('.g-fav');
  const searchInput    = document.getElementById('searchInput');
  const upgradeBtn     = document.getElementById('upgradeBtn');
  const notifyBtn      = document.getElementById('notifyBtn');
  const notifyBadge    = document.getElementById('notifyBadge');
  const viewAllBtn     = document.getElementById('viewAllBtn');
  const leaderRows     = document.querySelectorAll('.leader-row');
  const toast          = document.getElementById('toast');

  // ---- Counters ----
  function animateCounters() {
    statValues.forEach(el => {
      const target = +el.dataset.count;
      let cur = 0;
      const dur = 1400;
      const step = Math.max(1, Math.ceil(target / (dur / 16)));
      const tick = () => {
        cur = Math.min(cur + step, target);
        el.textContent = cur.toLocaleString();
        if (cur < target) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  // IntersectionObserver to fire once
  const statSection = document.querySelector('.stat-grid');
  if (statSection) {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        animateCounters();
        obs.disconnect();
      }
    }, { threshold: .35 });
    obs.observe(statSection);
  }

  // ---- Nav active state ----
  navItems.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      navItems.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showToast(`Switched to ${btn.dataset.section}`);
    });
  });

  // ---- Filter tabs ----
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const f = tab.dataset.filter;
      gameCards.forEach(c => {
        c.classList.toggle('hidden', f !== 'all' && c.dataset.status !== f);
      });
      showToast(`Filter: ${f.charAt(0).toUpperCase() + f.slice(1)}`);
    });
  });

  // ---- Play buttons ----
  playBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const game = btn.dataset.game;
      showToast(`Launching ${game}…`);
      btn.textContent = 'Loading…';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Play';
        btn.disabled = false;
      }, 1800);
    });
  });

  // ---- Favorite toggle ----
  favBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      btn.classList.toggle('on');
      showToast(btn.classList.contains('on') ? 'Added to favorites' : 'Removed from favorites');
    });
  });

  // ---- Search ----
  let searchTimer;
  searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const q = searchInput.value.toLowerCase().trim();
      gameCards.forEach(c => {
        const name = c.querySelector('h3').textContent.toLowerCase();
        c.classList.toggle('hidden', q && !name.includes(q));
      });
      if (q) showToast(`Searching: "${q}"`);
    }, 150);
  });

  // ---- Upgrade button ----
  upgradeBtn?.addEventListener('click', () => {
    showToast('Opening Pro upgrade…');
    upgradeBtn.textContent = 'Processing…';
    upgradeBtn.disabled = true;
    setTimeout(() => {
      upgradeBtn.textContent = 'Upgrade →';
      upgradeBtn.disabled = false;
    }, 2000);
  });

  // ---- Notification bell ----
  let notifyCount = 3;
  notifyBtn?.addEventListener('click', () => {
    notifyCount = Math.max(0, notifyCount - 1);
    notifyBadge.textContent = notifyCount;
    notifyBadge.style.opacity = notifyCount ? '1' : '0';
    showToast(notifyCount ? `${notifyCount} unread` : 'All caught up');
  });

  // ---- Leaderboard rows ----
  leaderRows.forEach(row => {
    row.addEventListener('click', () => {
      showToast(`Viewing ${row.dataset.player}'s profile`);
    });
  });

  // ---- View all leaderboard ----
  viewAllBtn?.addEventListener('click', () => {
    showToast('Opening full leaderboard…');
  });

  // ---- Toast helper ----
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }

  // ---- Keyboard shortcut: / to focus search ----
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput?.focus();
    }
  });

  // ---- Entrance stagger ----
  document.querySelectorAll('.panel, .stat-card, .game-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = `opacity .45s ease ${i * 40}ms, transform .45s ease ${i * 40}ms`;
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });
})();