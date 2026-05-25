import os
from sucuri.server import SucuriApp
from sucuri.parser import parse_sucuri
from sucuri.compiler import SucuriCompiler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
app = SucuriApp(template_dir=TEMPLATES_DIR)

state = app.state({
    "page_title": "Home",
})


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.get("/")
def index():
    return app.render("index.suc", state.data)


@app.get("/sucuri")
def sucuri_page():
    return app.render("sucuri.suc", {"page_title": "Sucuri"})


@app.post("/api/render")
def api_render(request):
    code = request.json.get("code", "")
    raw_ctx = request.json.get("context", {})
    if not isinstance(raw_ctx, dict):
        raw_ctx = {}
    try:
        ast = parse_sucuri(code)
        compiler = SucuriCompiler(raw_ctx, base_dir=TEMPLATES_DIR)
        html = compiler.compile(ast)
        return {"html": html}
    except Exception as exc:
        return {"error": str(exc)}


if __name__ == "__main__":
    app.run()
