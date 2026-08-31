# Marcos Stefani Rosa

Site pessoal de Marcos Stefani Rosa, reescrito com [Sucuri](https://github.com/marcosstefani/sucuri) — a template engine para Python que eu mesmo criei. Esta versão abandona o modelo estático e passa a rodar com servidor live, hot reload e um playground interativo para demonstrar as capacidades do Sucuri.

## Stack

| Camada | Tecnologia |
|---|---|
| Template engine | [Sucuri](https://github.com/marcosstefani/sucuri) |
| Servidor | `SucuriApp` (embutido no Sucuri) |
| Estilos | Tailwind CSS (build estático via CLI) + CSS customizado |
| Container | Docker (`FROM marcosstefani/sucuri`) |

## Estrutura

```
website/
├── templates/
│   ├── static/
│   │   ├── images/        # avatar e demais imagens
│   │   ├── scripts/
│   │   │   └── playground.js
│   │   └── style/
│   │       └── main.css
│   ├── index.suc          # homepage
│   ├── layout.suc         # layout base (nav + footer)
│   └── sucuri.suc         # página dedicada ao Sucuri
├── main.py                # app principal (rotas + /api/render)
└── Dockerfile
```

## Rodando localmente

```bash
npm install
npm run build:css   # gera templates/static/style/tailwind.css

pip install sucuri
sucuri serve main.py
# ou
python main.py
```

Durante o desenvolvimento, use `npm run watch:css` para recompilar o CSS a cada alteração nos templates.

Acesse em `http://localhost:8080`.

## Docker

```bash
docker build -t website .
docker run -p 8080:8080 website
```

## Páginas

| Rota | Descrição |
|---|---|
| `/` | Homepage — Dev, Música, Poesia, Contato |
| `/sucuri` | Página dedicada ao Sucuri com playground interativo |

## Playground `/sucuri`

A página `/sucuri` apresenta o Sucuri ao mundo com um editor interativo: o usuário edita código `.suc` e um contexto JSON, e o resultado renderiza em tempo real no painel direito — sem recarregar a página. Os exemplos cobrem variáveis, filtros, loops, condicionais, macros `list()` e `table()`, CSS shortcuts e atributos HTML.

A renderização usa o endpoint `POST /api/render` que compila o código Sucuri diretamente via `parse_sucuri` + `SucuriCompiler`, sem criar arquivos temporários.
