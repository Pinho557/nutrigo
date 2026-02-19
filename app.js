const MEAL_TYPES = ['pequeno-almoco', 'almoco', 'jantar', 'snack'];

const IMAGE_POOLS = {
  'pequeno-almoco': [
    'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80'
  ],
  almoco: [
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80'
  ],
  jantar: [
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=1200&q=80'
  ],
  snack: [
    'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=80'
  ]
};

const BASES = ['Frango', 'Peru', 'Salmão', 'Atum', 'Tofu', 'Ovos', 'Grão', 'Quinoa', 'Aveia', 'Iogurte'];
const STYLE = ['Mediterrânico', 'Proteico', 'Fit', 'Rápido', 'Energético', 'Low Carb', 'Balanceado', 'Veggie'];
const SIDES = ['com Legumes', 'com Arroz Integral', 'com Batata Doce', 'com Frutos Vermelhos', 'com Abacate', 'com Espinafres', 'com Sementes', 'com Molho de Iogurte'];

const TOTAL_RECIPES = 120;

const recipes = Array.from({ length: TOTAL_RECIPES }, (_, idx) => {
  const id = idx + 1;
  const type = MEAL_TYPES[idx % MEAL_TYPES.length];
  const base = BASES[idx % BASES.length];
  const style = STYLE[(idx * 3) % STYLE.length];
  const side = SIDES[(idx * 5) % SIDES.length];

  const protein = 14 + (idx % 9) * 3;
  const carbs = 18 + (idx % 10) * 5;
  const fat = 7 + (idx % 7) * 2;

  return {
    id,
    name: `${base} ${style} ${side}`,
    type,
    calories: Math.round(protein * 4 + carbs * 4 + fat * 9),
    protein,
    carbs,
    fat,
    image: IMAGE_POOLS[type][idx % IMAGE_POOLS[type].length]
  };
});

const state = {
  user: null,
  isPremium: false,
  favorites: new Set(),
  planHistory: []
};

const $ = (id) => document.getElementById(id);
const hasEl = (id) => Boolean($(id));

function showMessage(text) {
  if (!hasEl('globalMessage')) return;
  const node = $('globalMessage');
  node.textContent = text;
  node.classList.remove('hidden');
  setTimeout(() => node.classList.add('hidden'), 2600);
}

function mealTypeLabel(type) {
  return ({ 'pequeno-almoco': 'Pequeno-almoço', almoco: 'Almoço', jantar: 'Jantar', snack: 'Snack' }[type] || type);
}

function saveState() {
  localStorage.setItem('nutrigo_state', JSON.stringify({
    user: state.user,
    isPremium: state.isPremium,
    favorites: [...state.favorites],
    planHistory: state.planHistory
  }));
}

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem('nutrigo_state') || '{}');
    state.user = raw.user || null;
    state.isPremium = !!raw.isPremium;
    state.favorites = new Set(raw.favorites || []);
    state.planHistory = Array.isArray(raw.planHistory) ? raw.planHistory : [];
  } catch {
    localStorage.removeItem('nutrigo_state');
  }
}

function renderAuth() {
  if (hasEl('googleLoginBtn')) $('googleLoginBtn').classList.toggle('hidden', !!state.user);
  if (hasEl('logoutBtn')) $('logoutBtn').classList.toggle('hidden', !state.user);
  if (hasEl('userBadge')) {
    $('userBadge').classList.toggle('hidden', !state.user);
    $('userBadge').textContent = state.user ? state.user.name : '';
  }
  if (hasEl('profileName')) $('profileName').textContent = state.user ? state.user.name : 'Sem sessão iniciada.';
  if (hasEl('profileEmail')) $('profileEmail').textContent = state.user ? state.user.email : '';
  if (hasEl('planTier')) $('planTier').textContent = state.isPremium ? 'Premium' : 'Free';
  if (hasEl('premiumStatus')) {
    $('premiumStatus').textContent = state.isPremium
      ? 'Premium ativo: módulos avançados desbloqueados.'
      : 'Faz upgrade para desbloquear estes módulos.';
  }
}

function renderSummaryCards() {
  const selected = recipes.filter((r) => state.favorites.has(r.id));
  const totals = selected.reduce((acc, r) => ({
    calories: acc.calories + r.calories,
    protein: acc.protein + r.protein,
    carbs: acc.carbs + r.carbs,
    fat: acc.fat + r.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  if (hasEl('sumCalories')) $('sumCalories').textContent = `${totals.calories} kcal`;
  if (hasEl('sumProtein')) $('sumProtein').textContent = `${totals.protein} g`;
  if (hasEl('sumCarbs')) $('sumCarbs').textContent = `${totals.carbs} g`;
  if (hasEl('sumFat')) $('sumFat').textContent = `${totals.fat} g`;

  if (hasEl('selectedList')) {
    $('selectedList').innerHTML = selected.map((r) => `<li>${r.name}</li>`).join('') || '<li>Sem receitas favoritas ainda.</li>';
  }
}

function renderRecipes() {
  if (!hasEl('recipesGrid')) return;
  const search = hasEl('searchInput') ? $('searchInput').value.toLowerCase().trim() : '';
  const type = hasEl('mealTypeFilter') ? $('mealTypeFilter').value : '';

  const filtered = recipes.filter((r) => {
    const byName = r.name.toLowerCase().includes(search);
    const byType = !type || r.type === type;
    return byName && byType;
  });

  $('recipesGrid').innerHTML = filtered.map((r) => `
    <article class="card recipe-card">
      <img src="${r.image}" alt="${r.name}" class="recipe-image" loading="lazy" />
      <h4>${r.name}</h4>
      <p class="muted">${mealTypeLabel(r.type)}</p>
      <div class="recipe-meta">
        <span><strong>${r.calories}</strong> kcal</span>
        <span><strong>${r.protein}g</strong> proteína</span>
        <span><strong>${r.carbs}g</strong> hidratos</span>
        <span><strong>${r.fat}g</strong> gordura</span>
      </div>
      <button class="cta" type="button" onclick="toggleFavorite(${r.id})">${state.favorites.has(r.id) ? 'Remover favorito' : 'Favoritar'}</button>
    </article>
  `).join('');

  if (!filtered.length) {
    $('recipesGrid').innerHTML = '<article class="card">Sem resultados para os filtros atuais.</article>';
  }
}

window.toggleFavorite = function toggleFavorite(id) {
  if (!state.user) return showMessage('Faz login para guardar favoritos.');
  if (state.favorites.has(id)) state.favorites.delete(id); else state.favorites.add(id);
  saveState();
  renderRecipes();
  renderSummaryCards();
};

function renderProfilePlan() {
  if (!hasEl('profilePlan')) return;
  if (!state.planHistory.length) {
    $('profilePlan').innerHTML = 'Ainda não tens plano guardado.';
    return;
  }

  const latest = state.planHistory[0];
  $('profilePlan').innerHTML = `
    Objetivo: <strong>${latest.goal}</strong><br>
    Calorias: <strong>${latest.calories}</strong><br>
    Refeições: <strong>${latest.meals}</strong><br>
    Proteína/Hidratos/Gordura: <strong>${latest.protein}g / ${latest.carbs}g / ${latest.fat}g</strong>
  `;

  if (hasEl('planHistoryList')) {
    $('planHistoryList').innerHTML = state.planHistory.slice(0, 5).map((p, i) =>
      `<li>#${i + 1} — ${p.goal}, ${p.calories} kcal, ${p.meals} refeições</li>`).join('');
  }
}

function bindEvents() {
  if (hasEl('googleLoginBtn')) {
    $('googleLoginBtn').addEventListener('click', () => {
      state.user = { name: 'Utilizador NutriGo', email: 'utilizador@nutrigo.app' };
      saveState();
      renderAuth();
      showMessage('Sessão iniciada com Google (demo).');
    });
  }

  if (hasEl('logoutBtn')) {
    $('logoutBtn').addEventListener('click', () => {
      state.user = null;
      state.isPremium = false;
      state.favorites.clear();
      saveState();
      renderAuth();
      renderRecipes();
      renderSummaryCards();
      showMessage('Sessão terminada.');
    });
  }

  if (hasEl('upgradeBtn')) {
    $('upgradeBtn').addEventListener('click', () => {
      if (!state.user) return showMessage('Faz login para ativar premium.');
      state.isPremium = true;
      saveState();
      renderAuth();
      showMessage('Premium ativado em modo demo.');
    });
  }

  if (hasEl('searchInput')) $('searchInput').addEventListener('input', renderRecipes);
  if (hasEl('mealTypeFilter')) $('mealTypeFilter').addEventListener('change', renderRecipes);
  if (hasEl('clearFilters')) {
    $('clearFilters').addEventListener('click', () => {
      $('searchInput').value = '';
      $('mealTypeFilter').value = '';
      renderRecipes();
    });
  }

  if (hasEl('plannerForm')) {
    $('plannerForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const goal = $('goal').value;
      const calories = Number($('calories').value);
      const meals = Number($('meals').value);
      const protein = Math.round((calories * 0.3) / 4);
      const carbs = Math.round((calories * 0.4) / 4);
      const fat = Math.round((calories * 0.3) / 9);

      const plan = { goal, calories, meals, protein, carbs, fat, createdAt: new Date().toISOString() };
      state.planHistory.unshift(plan);
      state.planHistory = state.planHistory.slice(0, 20);
      saveState();

      $('planResult').classList.remove('hidden');
      $('planResult').innerHTML = `
        <h4>Plano gerado (${goal})</h4>
        <p class="muted">Plano guardado no teu perfil automaticamente.</p>
        <div class="summary-grid" style="margin-top:10px">
          <article class="card"><h4>Proteína</h4><p>${protein} g</p></article>
          <article class="card"><h4>Hidratos</h4><p>${carbs} g</p></article>
          <article class="card"><h4>Gordura</h4><p>${fat} g</p></article>
          <article class="card"><h4>Por refeição</h4><p>${Math.round(calories / meals)} kcal</p></article>
        </div>
      `;
      renderProfilePlan();
      showMessage('Plano guardado com sucesso.');
    });
  }
}

(function init() {
  loadState();
  bindEvents();
  renderAuth();
  renderRecipes();
  renderSummaryCards();
  renderProfilePlan();
})();
