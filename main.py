import os
import time
import json
from threading import Lock
from datetime import datetime
from urllib import error, request

from sucuri.server import SucuriApp
from sucuri.parser import parse_sucuri
from sucuri.compiler import SucuriCompiler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
app = SucuriApp(template_dir=TEMPLATES_DIR)

def base_context(page_title):
    year = datetime.now().year
    return {
        "page_title": page_title,
        "current_year": year,
        "footer_text": f"Porto, Portugal · {year}",
    }


STAR_FALLBACKS = {
    "sucuri_stars": 27,
    "sqla_lite_stars": 0,
    "gittool_stars": 1,
}

STAR_REPOS = {
    "sucuri_stars": "marcosstefani/sucuri",
    "sqla_lite_stars": "ElaraDevSolutions/sqla-lite",
    "gittool_stars": "ElaraDevSolutions/gittool",
}

_STAR_CACHE = {
    "expires_at": 0,
    "data": STAR_FALLBACKS.copy(),
}

_RENDER_WINDOW_SECONDS = 60
_RENDER_MAX_REQUESTS = 30
_RENDER_MAX_CODE_LENGTH = 20_000
_RENDER_MAX_CONTEXT_LENGTH = 10_000
_RENDER_REQUESTS = []
_RENDER_REQUESTS_LOCK = Lock()


def _render_rate_limited():
    now = time.time()
    cutoff = now - _RENDER_WINDOW_SECONDS
    with _RENDER_REQUESTS_LOCK:
        while _RENDER_REQUESTS and _RENDER_REQUESTS[0] <= cutoff:
            _RENDER_REQUESTS.pop(0)
        if len(_RENDER_REQUESTS) >= _RENDER_MAX_REQUESTS:
            return True
        _RENDER_REQUESTS.append(now)
    return False


def _fetch_stars(repo):
    req = request.Request(
        f"https://api.github.com/repos/{repo}",
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "marcosstefani-portfolio",
        },
    )
    with request.urlopen(req, timeout=3) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
    stars = payload.get("stargazers_count")
    if not isinstance(stars, int):
        raise ValueError("stargazers_count missing")
    return stars


def get_stars_context():
    now = time.time()
    if now < _STAR_CACHE["expires_at"]:
        return _STAR_CACHE["data"]

    data = STAR_FALLBACKS.copy()
    for key, repo in STAR_REPOS.items():
        try:
            data[key] = _fetch_stars(repo)
        except (error.URLError, TimeoutError, ValueError, json.JSONDecodeError):
            data[key] = _STAR_CACHE["data"].get(key, STAR_FALLBACKS[key])

    _STAR_CACHE["data"] = data
    _STAR_CACHE["expires_at"] = now + (60 * 15)
    return data


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.get("/")
def index():
    ctx = base_context("Home")
    ctx.update(get_stars_context())
    return app.render("index.suc", ctx)


@app.get("/sucuri")
def sucuri_page():
    return app.render("sucuri.suc", base_context("Sucuri"))


@app.get("/sqla-lite")
def sqla_lite_page():
    return app.render("sqla-lite.suc", base_context("sqla-lite"))


@app.post("/api/render")
def api_render(request):
    if _render_rate_limited():
        return {"error": "Too many render requests. Try again shortly."}

    payload = request.json
    if not isinstance(payload, dict):
        return {"error": "Invalid JSON payload."}

    code = payload.get("code", "")
    raw_ctx = payload.get("context", {})
    if not isinstance(code, str) or len(code) > _RENDER_MAX_CODE_LENGTH:
        return {"error": "Code is invalid or too long."}
    if not isinstance(raw_ctx, dict):
        return {"error": "Context must be a JSON object."}
    if len(json.dumps(raw_ctx)) > _RENDER_MAX_CONTEXT_LENGTH:
        return {"error": "Context is too large."}
    try:
        ast = parse_sucuri(code)
        compiler = SucuriCompiler(raw_ctx, base_dir=TEMPLATES_DIR)
        html = compiler.compile(ast)
        return {"html": html}
    except Exception as exc:
        return {"error": str(exc)}


if __name__ == "__main__":
    app.run()
