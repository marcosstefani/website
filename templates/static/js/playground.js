// ── Examples ──────────────────────────────────────────────────────────────────
const EXAMPLES = [
  {
    id: 'variaveis',
    title: 'Variáveis',
    desc: 'Interpolação de contexto Python com suporte a objetos aninhados e filtros.',
    code: `div
    h2 Olá, {user.name}!
    p.role {user.role | title}
    span.badge {lang | upper}`,
    ctx: { user: { name: 'Marcos', role: 'desenvolvedor' }, lang: 'python' }
  },
  {
    id: 'filtros',
    title: 'Filtros',
    desc: 'Transformações encadeáveis com o operador pipe |.',
    code: `div
    p {titulo | upper}
    p {subtitulo | lower}
    p {autor | title}
    p {raw | lower | title}`,
    ctx: {
      titulo: 'template engine',
      subtitulo: 'SUCURI ROCKS',
      autor: 'marcos stefani rosa',
      raw: 'PYTHON É INCRÍVEL'
    }
  },
  {
    id: 'loop',
    title: 'For Loop',
    desc: 'Iteração sobre arrays com <for> e acesso dinâmico via #.',
    code: `ul
    <for skill in skills>
        li #skill
    <endfor>`,
    ctx: { skills: ['Python', 'Java', 'Kotlin', 'Docker', 'Sucuri'] }
  },
  {
    id: 'condicional',
    title: 'Condicionais',
    desc: 'Renderização condicional com blocos <if> / <endif>.',
    code: `div
    <if user.premium>
        span ⭐ Premium
    <endif>
    h3 {user.name}
    <if user.active>
        p ● Online
    <endif>
    <if user.premium == false>
        p Conta gratuita
    <endif>`,
    ctx: { user: { name: 'Marcos Stefani', premium: true, active: true } }
  },
  {
    id: 'lista',
    title: 'Macro: list()',
    desc: 'Macro embutida para renderizar arrays como listas HTML.',
    code: `list(tech)`,
    ctx: { tech: ['Python', 'FastAPI', 'Sucuri', 'Docker', 'PostgreSQL'] }
  },
  {
    id: 'tabela',
    title: 'Macro: table()',
    desc: 'Macro embutida para dados tabulares: cabeçalhos, linhas e rodapé.',
    code: `table(heads rows footers)`,
    ctx: {
      heads: ['Projeto', 'Linguagem', 'Estrelas'],
      rows: [
        ['sucuri', 'Python', '★ 27'],
        ['sqla-lite', 'Python', 'PyPI'],
        ['gittool', 'Go', '★ 1']
      ],
      footers: ['', '', '3 projetos']
    }
  },
  {
    id: 'css',
    title: 'CSS Shortcuts',
    desc: 'Atalhos .classe e #id para classes e IDs, ao estilo PugJS.',
    code: `#app
    div.card
        h2.titulo Sucuri
        p.subtitulo Template engine elegante
    div.badges
        span.badge Python
        span.badge Lark
        span.badge MIT`,
    ctx: {}
  },
  {
    id: 'atributos',
    title: 'Atributos HTML',
    desc: 'Tags com atributos completos separados por espaço dentro de ().',
    code: `form(action="/login" method="post")
    input(type="text" name="usuario" placeholder="Usuário")
    input(type="password" name="senha" placeholder="Senha")
    select(name="perfil")
        option(value="dev") Desenvolvedor
        option(value="designer") Designer
        option(value="pm") Product Manager
    button(type="submit") Entrar`,
    ctx: {}
  }
];

// ── State ─────────────────────────────────────────────────────────────────────
let currentIndex = 0;
let debounceTimer = null;
let currentView = 'preview';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const codeArea      = document.getElementById('suc-code');
const ctxArea       = document.getElementById('suc-context');
const previewFrame  = document.getElementById('preview-frame');
const htmlOutput    = document.getElementById('html-output');
const errorMsg      = document.getElementById('error-msg');
const tabsContainer = document.getElementById('example-tabs');
const btnPreview    = document.getElementById('view-preview');
const btnHtml       = document.getElementById('view-html');
const copyInstall   = document.getElementById('copy-install');

// ── Preview wrapper ───────────────────────────────────────────────────────────
function wrapPreview(html) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
  *, *::before, *::after { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; padding: 1.25rem; color: #1f2937; line-height: 1.6; font-size: 14px; }
  h1, h2, h3, h4 { margin: 0 0 .5rem; font-weight: 700; color: #111; }
  p { margin: 0 0 .5rem; }
  ul, ol { padding-left: 1.5rem; margin: 0 0 .5rem; }
  li { margin-bottom: .25rem; }
  a { color: #7c3aed; }
  table { width: 100%; border-collapse: collapse; margin: .5rem 0; font-size: .85rem; }
  th { background: #7c3aed; color: #fff; padding: 8px 12px; text-align: left; font-weight: 600; }
  td { border: 1px solid #e5e7eb; padding: 8px 12px; }
  tr:nth-child(even) td { background: #f9fafb; }
  tfoot td { background: #f3f4f6; font-weight: 600; color: #6b7280; font-size: .8rem; }
  input, select, textarea { display: block; width: 100%; margin-bottom: .5rem; padding: .4rem .75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: .875rem; font-family: inherit; }
  button { background: #7c3aed; color: #fff; border: none; cursor: pointer; padding: .45rem 1.25rem; border-radius: 6px; font-size: .875rem; font-weight: 600; }
  button:hover { background: #6d28d9; }
  form { max-width: 320px; }
  .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1rem; margin-bottom: .75rem; }
  .badge { display: inline-block; background: #ede9fe; color: #7c3aed; padding: 2px 10px; border-radius: 20px; font-size: .75rem; font-weight: 600; margin: 2px; }
  .tag { display: inline-block; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 4px; padding: 2px 8px; font-size: .75rem; margin: 2px; }
  .titulo { color: #111; margin: 0 0 .25rem; }
  .subtitulo { color: #6b7280; font-size: .875rem; margin: 0; }
  .role { color: #7c3aed; font-weight: 600; font-size: .875rem; margin: .25rem 0; }
  .status { color: #16a34a; font-size: .875rem; margin: .25rem 0; }
  .badges { display: flex; flex-wrap: wrap; gap: 4px; margin-top: .5rem; }
  #app { padding: .5rem; }
</style></head><body>${html}</body></html>`;
}

// ── API call ──────────────────────────────────────────────────────────────────
async function renderCode() {
  const code = codeArea.value;
  let ctx = {};
  try {
    ctx = JSON.parse(ctxArea.value || '{}');
  } catch {
    showError('JSON inválido no contexto.');
    return;
  }
  try {
    const res = await fetch('/api/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, context: ctx })
    });
    const data = await res.json();
    if (data.error) {
      showError(data.error);
    } else {
      hideError();
      updatePreview(data.html);
    }
  } catch {
    showError('Erro ao conectar ao servidor.');
  }
}

function updatePreview(html) {
  previewFrame.srcdoc = wrapPreview(html);
  htmlOutput.textContent = html;
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove('hidden');
}

function hideError() {
  errorMsg.classList.add('hidden');
}

function debounceRender() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(renderCode, 350);
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
function renderTabs() {
  tabsContainer.innerHTML = '';
  EXAMPLES.forEach((ex, i) => {
    const btn = document.createElement('button');
    btn.textContent = ex.title;
    btn.title = ex.desc;
    btn.className = i === currentIndex
      ? 'px-4 py-2 text-sm font-semibold rounded-xl bg-violet-600 text-white transition-colors'
      : 'px-4 py-2 text-sm font-medium rounded-xl text-zinc-400 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:text-white transition-colors';
    btn.addEventListener('click', () => selectExample(i));
    tabsContainer.appendChild(btn);
  });
}

function selectExample(index) {
  currentIndex = index;
  const ex = EXAMPLES[index];
  codeArea.value = ex.code;
  ctxArea.value = JSON.stringify(ex.ctx, null, 2);
  renderTabs();
  renderCode();
}

// ── View toggle ───────────────────────────────────────────────────────────────
const ACTIVE_BTN   = 'px-3 py-1 text-xs rounded-lg bg-violet-600 text-white font-medium';
const INACTIVE_BTN = 'px-3 py-1 text-xs rounded-lg text-zinc-400 hover:text-white transition-colors';

btnPreview.addEventListener('click', () => {
  currentView = 'preview';
  previewFrame.classList.remove('hidden');
  htmlOutput.classList.add('hidden');
  btnPreview.className = ACTIVE_BTN;
  btnHtml.className = INACTIVE_BTN;
});

btnHtml.addEventListener('click', () => {
  currentView = 'html';
  previewFrame.classList.add('hidden');
  htmlOutput.classList.remove('hidden');
  btnHtml.className = ACTIVE_BTN;
  btnPreview.className = INACTIVE_BTN;
});

// ── Tab key support ───────────────────────────────────────────────────────────
codeArea.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  e.preventDefault();
  const s = codeArea.selectionStart;
  const end = codeArea.selectionEnd;
  codeArea.value = codeArea.value.substring(0, s) + '    ' + codeArea.value.substring(end);
  codeArea.selectionStart = codeArea.selectionEnd = s + 4;
  debounceRender();
});

// ── Live input ────────────────────────────────────────────────────────────────
codeArea.addEventListener('input', debounceRender);
ctxArea.addEventListener('input', debounceRender);

// ── Copy pip install ──────────────────────────────────────────────────────────
if (copyInstall) {
  copyInstall.addEventListener('click', () => {
    navigator.clipboard.writeText('pip install sucuri').then(() => {
      copyInstall.textContent = '✓ copiado';
      setTimeout(() => { copyInstall.textContent = 'copiar'; }, 2000);
    });
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────
renderTabs();
selectExample(0);
