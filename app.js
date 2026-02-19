const TOTAL_RECIPES = 100;

const recipeCatalog = [
  { name: 'Bowl de Frango e Quinoa', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80' },
  { name: 'Aveia Overnight com Frutos Vermelhos', image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=900&q=80' },
  { name: 'Salmão com Legumes Assados', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80' },
  { name: 'Omelete Proteica', image: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=900&q=80' },
  { name: 'Wrap de Atum e Abacate', image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=900&q=80' },
  { name: 'Iogurte Grego com Granola', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80' },
  { name: 'Tofu Salteado com Arroz Integral', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80' },
  { name: 'Panquecas de Banana e Aveia', image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=80' },
  { name: 'Salada Mediterrânica com Grão', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80' },
  { name: 'Peru no Forno com Batata Doce', image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80' }
];

const mealTypes = ['pequeno-almoco', 'almoco', 'jantar', 'snack'];
const recipes = Array.from({ length: TOTAL_RECIPES }, (_, idx) => {
  const id = idx + 1;
  const baseRecipe = recipeCatalog[idx % recipeCatalog.length];
  const type = mealTypes[idx % mealTypes.length];
  const protein = 12 + (idx % 7) * 4;
  const carbs = 14 + (idx % 8) * 6;
  const fat = 6 + (idx % 6) * 3;
  return {
    id,
    name: `${baseRecipe.name} #${id}`,
    type,
    calories: 220 + (idx % 9) * 35 + protein + fat,
    protein,
    carbs,
    fat,
    image: baseRecipe.image
  };
});

const selectedRecipes = new Set();
const state = { user: null, isPremium: false, lastPlan: null };

const $ = (id) => document.getElementById(id);
const exists = (id) => Boolean($(id));

function showMessage(text) {
  if (!exists('globalMessage')) return;
  const node = $('globalMessage');
  node.textContent = text;
  node.classList.remove('hidden');
  setTimeout(() => node.classList.add('hidden'), 2400);
}

function isAuthenticated() { return !!state.user; }

function mealTypeLabel(type) {
  return ({ 'pequeno-almoco': 'Pequeno-almoço', almoco: 'Almoço', jantar: 'Jantar', snack: 'Snack' }[type] || type);
}

function saveState() {
  localStorage.setItem('nutrigo_auth', JSON.stringify({ user: state.user, isPremium: state.isPremium, lastPlan: state.lastPlan }));
  localStorage.setItem('nutrigo_selected', JSON.stringify([...selectedRecipes]));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('nutrigo_auth') || '{}');
    state.user = saved.user || null;
    state.isPremium = !!saved.isPremium;
    state.lastPlan = saved.lastPlan || null;
    JSON.parse(localStorage.getItem('nutrigo_selected') || '[]').forEach((id) => selectedRecipes.add(id));
  } catch {
    localStorage.removeItem('nutrigo_auth');
    localStorage.removeItem('nutrigo_selected');
  }
}

function renderAuthUI() {
  if (exists('googleLoginBtn')) $('googleLoginBtn').classList.toggle('hidden', isAuthenticated());
  if (exists('logoutBtn')) $('logoutBtn').classList.toggle('hidden', !isAuthenticated());
  if (exists('userBadge')) {
    $('userBadge').classList.toggle('hidden', !isAuthenticated());
    $('userBadge').textContent = isAuthenticated() ? state.user.name : '';
  }

  if (exists('profileName')) $('profileName').textContent = isAuthenticated() ? state.user.name : 'Sem sessão iniciada.';
  if (exists('profileEmail')) $('profileEmail').textContent = isAuthenticated() ? state.user.email : '';
  if (exists('planTier')) $('planTier').textContent = state.isPremium ? 'Premium' : 'Free';
  if (exists('premiumStatus')) {
    $('premiumStatus').textContent = state.isPremium
      ? 'Tens acesso premium ativo. Recomendações avançadas e analytics desbloqueados.'
      : 'Faz upgrade para desbloquear estes módulos futuramente.';
  }

  if (exists('profilePlan')) {
    $('profilePlan').innerHTML = state.lastPlan
      ? `Objetivo: <strong>${state.lastPlan.goal}</strong><br>Kcal: <strong>${state.lastPlan.calories}</strong><br>Refeições: <strong>${state.lastPlan.meals}</strong>`
      : 'Ainda não tens plano guardado.';
  }
}

function renderSummary() {
  const selected = recipes.filter((r) => selectedRecipes.has(r.id));
  const totals = selected.reduce((acc, r) => ({
    calories: acc.calories + r.calories,
    protein: acc.protein + r.protein,
    carbs: acc.carbs + r.carbs,
    fat: acc.fat + r.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  if (exists('sumCalories')) $('sumCalories').textContent = `${totals.calories} kcal`;
  if (exists('sumProtein')) $('sumProtein').textContent = `${totals.protein} g`;
  if (exists('sumCarbs')) $('sumCarbs').textContent = `${totals.carbs} g`;
  if (exists('sumFat')) $('sumFat').textContent = `${totals.fat} g`;

  if (exists('selectedList')) {
    $('selectedList').innerHTML = selected.map((r) => `<li>${r.name}</li>`).join('') || '<li>Nenhuma receita favorita.</li>';
  }
}

window.toggleRecipe = function toggleRecipe(id) {
  if (!isAuthenticated()) return showMessage('Faz login para favoritar receitas.');
  if (selectedRecipes.has(id)) selectedRecipes.delete(id); else selectedRecipes.add(id);
  saveState();
  renderRecipes();
  renderSummary();
};

function renderRecipes() {
  if (!exists('recipesGrid')) return;
  const search = exists('searchInput') ? $('searchInput').value.toLowerCase().trim() : '';
  const type = exists('mealTypeFilter') ? $('mealTypeFilter').value : '';
  const filtered = recipes.filter((r) => r.name.toLowerCase().includes(search) && (!type || r.type === type));

  $('recipesGrid').innerHTML = filtered.map((r) => `
    <article class="card recipe-card">
      <img src="${r.image}" alt="${r.name}" loading="lazy" class="recipe-image" />
      <h4>${r.name}</h4>
      <p class="muted">${mealTypeLabel(r.type)}</p>
      <div class="recipe-meta">
        <span><strong>${r.calories}</strong> kcal</span>
        <span><strong>${r.protein}g</strong> proteína</span>
        <span><strong>${r.carbs}g</strong> hidratos</span>
        <span><strong>${r.fat}g</strong> gordura</span>
      </div>
      <button class="cta" type="button" onclick="toggleRecipe(${r.id})">${selectedRecipes.has(r.id) ? 'Remover favorito' : 'Favoritar receita'}</button>
    </article>
  `).join('') || '<article class="card">Sem resultados para os filtros atuais.</article>';
}

function bindEvents() {
  if (exists('googleLoginBtn')) {
    $('googleLoginBtn').addEventListener('click', () => {
      state.user = { name: 'Utilizador Google', email: 'utilizador.google@nutrigo.app' };
      saveState(); renderAuthUI(); showMessage('Sessão iniciada com Google (demo).');
    });
  }

  if (exists('logoutBtn')) {
    $('logoutBtn').addEventListener('click', () => {
      state.user = null; state.isPremium = false; selectedRecipes.clear(); state.lastPlan = null;
      saveState(); renderAuthUI(); renderRecipes(); renderSummary(); showMessage('Sessão terminada.');
    });
  }

  if (exists('upgradeBtn')) {
    $('upgradeBtn').addEventListener('click', () => {
      if (!isAuthenticated()) return showMessage('Faz login para ativares o premium.');
      state.isPremium = true; saveState(); renderAuthUI(); showMessage('Premium ativado em modo demo.');
    });
  }

  if (exists('searchInput')) $('searchInput').addEventListener('input', renderRecipes);
  if (exists('mealTypeFilter')) $('mealTypeFilter').addEventListener('change', renderRecipes);
  if (exists('clearFilters')) $('clearFilters').addEventListener('click', () => { $('searchInput').value = ''; $('mealTypeFilter').value = ''; renderRecipes(); });

  if (exists('plannerForm')) {
    $('plannerForm').addEventListener('submit', (event) => {
      event.preventDefault();
      if (!isAuthenticated()) return showMessage('Inicia sessão para criares planos personalizados.');

      const goal = $('goal').value;
      const calories = Number($('calories').value);
      const meals = Number($('meals').value);
      const protein = Math.round((calories * 0.3) / 4);
      const carbs = Math.round((calories * 0.4) / 4);
      const fat = Math.round((calories * 0.3) / 9);

      state.lastPlan = { goal, calories, meals, protein, carbs, fat };
      saveState();

      $('planResult').classList.remove('hidden');
      $('planResult').innerHTML = `
        <h4>Plano gerado (${goal})</h4>
        <p class="muted">Meta diária: ${calories} kcal em ${meals} refeições.</p>
        <div class="summary-grid" style="margin-top:10px">
          <article class="card"><h4>Proteína</h4><p>${protein} g</p></article>
          <article class="card"><h4>Hidratos</h4><p>${carbs} g</p></article>
          <article class="card"><h4>Gordura</h4><p>${fat} g</p></article>
          <article class="card"><h4>Por refeição</h4><p>${Math.round(calories / meals)} kcal</p></article>
        </div>`;
      showMessage('Plano guardado no teu perfil.');
    });
  }
}

(function init() {
  loadState();
  bindEvents();
  renderAuthUI();
  renderRecipes();
  renderSummary();
})();
