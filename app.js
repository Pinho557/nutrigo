const TOTAL_RECIPES = 100;

const recipeNames = [
  'Bowl de Frango e Quinoa',
  'Aveia Overnight com Frutos Vermelhos',
  'Salmão com Legumes Assados',
  'Omelete Proteica',
  'Wrap de Atum e Abacate',
  'Iogurte Grego com Granola',
  'Tofu Salteado com Arroz Integral',
  'Panquecas de Banana e Aveia',
  'Salada Mediterrânica com Grão',
  'Peru no Forno com Batata Doce'
];

const mealTypes = ['pequeno-almoco', 'almoco', 'jantar', 'snack'];

const recipes = Array.from({ length: TOTAL_RECIPES }, (_, idx) => {
  const id = idx + 1;
  const type = mealTypes[idx % mealTypes.length];
  const base = 220 + (idx % 9) * 35;
  const protein = 12 + (idx % 7) * 4;
  const carbs = 14 + (idx % 8) * 6;
  const fat = 6 + (idx % 6) * 3;

  return {
    id,
    name: `${recipeNames[idx % recipeNames.length]} #${id}`,
    type,
    calories: base + protein + fat,
    protein,
    carbs,
    fat,
    image: `https://picsum.photos/seed/nutrigo-recipe-${id}/640/380`
  };
});

const selectedRecipes = new Set();

const state = {
  user: null,
  isPremium: false
};

function showMessage(text) {
  const node = document.getElementById('globalMessage');
  node.textContent = text;
  node.classList.remove('hidden');
  setTimeout(() => node.classList.add('hidden'), 2800);
}

function isAuthenticated() {
  return !!state.user;
}

function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach((tab) => tab.classList.remove('active'));
  document.querySelectorAll('[data-tab]').forEach((btn) => btn.classList.remove('active-tab'));
  document.getElementById(tabId).classList.add('active');
  const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.classList.add('active-tab');
}

document.querySelectorAll('[data-tab]').forEach((button) => {
  button.addEventListener('click', () => switchTab(button.dataset.tab));
});

function mealTypeLabel(type) {
  return ({
    'pequeno-almoco': 'Pequeno-almoço',
    almoco: 'Almoço',
    jantar: 'Jantar',
    snack: 'Snack'
  }[type] || type);
}

function renderRecipes() {
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const type = document.getElementById('mealTypeFilter').value;
  const grid = document.getElementById('recipesGrid');

  const filtered = recipes.filter((r) => {
    const matchesName = r.name.toLowerCase().includes(search);
    const matchesType = !type || r.type === type;
    return matchesName && matchesType;
  });

  grid.innerHTML = filtered.map((r) => `
    <article class="card recipe-card">
      <img src="${r.image}" alt="${r.name}" loading="lazy" class="recipe-image" />
      <h3>${r.name}</h3>
      <p class="muted">${mealTypeLabel(r.type)}</p>
      <div class="recipe-meta">
        <span><strong>${r.calories}</strong> kcal</span>
        <span><strong>${r.protein}g</strong> proteína</span>
        <span><strong>${r.carbs}g</strong> hidratos</span>
        <span><strong>${r.fat}g</strong> gordura</span>
      </div>
      <button class="cta" type="button" onclick="toggleRecipe(${r.id})">
        ${selectedRecipes.has(r.id) ? 'Remover favorito' : 'Favoritar receita'}
      </button>
    </article>
  `).join('');

  if (!filtered.length) {
    grid.innerHTML = '<article class="card">Sem resultados para os filtros atuais.</article>';
  }
}

function updateSummary() {
  const selected = recipes.filter((r) => selectedRecipes.has(r.id));
  const totals = selected.reduce((acc, r) => ({
    calories: acc.calories + r.calories,
    protein: acc.protein + r.protein,
    carbs: acc.carbs + r.carbs,
    fat: acc.fat + r.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  document.getElementById('sumCalories').textContent = `${totals.calories} kcal`;
  document.getElementById('sumProtein').textContent = `${totals.protein} g`;
  document.getElementById('sumCarbs').textContent = `${totals.carbs} g`;
  document.getElementById('sumFat').textContent = `${totals.fat} g`;

  const list = document.getElementById('selectedList');
  list.innerHTML = selected.map((r) => `<li>${r.name}</li>`).join('') || '<li>Nenhuma receita favorita.</li>';

  localStorage.setItem('nutrigo_selected', JSON.stringify([...selectedRecipes]));
}

function renderAuthUI() {
  const loginBtn = document.getElementById('googleLoginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const badge = document.getElementById('userBadge');
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const planTier = document.getElementById('planTier');
  const premiumStatus = document.getElementById('premiumStatus');

  if (isAuthenticated()) {
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    badge.classList.remove('hidden');
    badge.textContent = state.user.name;
    profileName.textContent = state.user.name;
    profileEmail.textContent = state.user.email;
  } else {
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    badge.classList.add('hidden');
    badge.textContent = '';
    profileName.textContent = 'Sem sessão iniciada.';
    profileEmail.textContent = '';
  }

  planTier.textContent = state.isPremium ? 'Premium' : 'Free';
  premiumStatus.textContent = state.isPremium
    ? 'Tens acesso premium ativo. Futuras funcionalidades serão ativadas nesta conta.'
    : 'Faz upgrade para desbloquear estes módulos futuramente.';
}

function saveAuthState() {
  localStorage.setItem('nutrigo_auth', JSON.stringify({ user: state.user, isPremium: state.isPremium }));
}

function loginWithGoogleMock() {
  state.user = {
    name: 'Utilizador Google',
    email: 'utilizador.google@nutrigo.app'
  };
  saveAuthState();
  renderAuthUI();
  showMessage('Sessão iniciada com Google (modo demo).');
}

function logout() {
  state.user = null;
  state.isPremium = false;
  selectedRecipes.clear();
  localStorage.removeItem('nutrigo_selected');
  saveAuthState();
  renderAuthUI();
  renderRecipes();
  updateSummary();
  showMessage('Sessão terminada.');
}

window.toggleRecipe = function toggleRecipe(id) {
  if (!isAuthenticated()) {
    showMessage('Faz login para favoritar receitas.');
    return;
  }
  if (selectedRecipes.has(id)) selectedRecipes.delete(id);
  else selectedRecipes.add(id);
  renderRecipes();
  updateSummary();
};

document.getElementById('searchInput').addEventListener('input', renderRecipes);
document.getElementById('mealTypeFilter').addEventListener('change', renderRecipes);
document.getElementById('clearFilters').addEventListener('click', () => {
  document.getElementById('searchInput').value = '';
  document.getElementById('mealTypeFilter').value = '';
  renderRecipes();
});

document.getElementById('plannerForm').addEventListener('submit', (event) => {
  event.preventDefault();

  if (!isAuthenticated()) {
    showMessage('Inicia sessão para criares planos personalizados.');
    return;
  }

  const goal = document.getElementById('goal').value;
  const calories = Number(document.getElementById('calories').value);
  const meals = Number(document.getElementById('meals').value);

  const protein = Math.round((calories * 0.3) / 4);
  const carbs = Math.round((calories * 0.4) / 4);
  const fat = Math.round((calories * 0.3) / 9);

  const result = document.getElementById('planResult');
  result.classList.remove('hidden');
  result.innerHTML = `
    <h3>Plano gerado (${goal})</h3>
    <p class="muted">Meta diária: ${calories} kcal divididas em ${meals} refeições.</p>
    <div class="summary-grid" style="margin-top:10px">
      <article class="card"><h4>Proteína</h4><p>${protein} g</p></article>
      <article class="card"><h4>Hidratos</h4><p>${carbs} g</p></article>
      <article class="card"><h4>Gordura</h4><p>${fat} g</p></article>
      <article class="card"><h4>Por refeição</h4><p>${Math.round(calories / meals)} kcal</p></article>
    </div>
  `;
});

document.getElementById('googleLoginBtn').addEventListener('click', loginWithGoogleMock);
document.getElementById('logoutBtn').addEventListener('click', logout);

document.getElementById('upgradeBtn').addEventListener('click', () => {
  if (!isAuthenticated()) {
    showMessage('Faz login para ativares o premium.');
    return;
  }
  state.isPremium = true;
  saveAuthState();
  renderAuthUI();
  showMessage('Premium ativado em modo demo.');
});

(function init() {
  try {
    const saved = JSON.parse(localStorage.getItem('nutrigo_auth') || '{}');
    state.user = saved.user || null;
    state.isPremium = !!saved.isPremium;

    const savedRecipes = JSON.parse(localStorage.getItem('nutrigo_selected') || '[]');
    savedRecipes.forEach((id) => selectedRecipes.add(id));
  } catch (_e) {
    localStorage.removeItem('nutrigo_auth');
    localStorage.removeItem('nutrigo_selected');
  }

  renderAuthUI();
  renderRecipes();
  updateSummary();
  switchTab('planner');
})();
