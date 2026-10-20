#!/usr/bin/env python3
"""Sube un Short a YouTube con la YouTube Data API v3 (solo biblioteca estándar).

Credenciales (variables de entorno, nunca en el código):
  YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN

Ejemplos:
  python3 subir_short.py --check
  python3 subir_short.py video.mp4 --title "Tus dientes cuando comes azúcar" --dry-run
  python3 subir_short.py video.mp4 --meta short01.json
  python3 subir_short.py video.mp4 --title "..." --publish-at 2026-10-25T14:00:00Z

Por defecto el video queda PRIVADO: se revisa en YouTube Studio antes de publicar.
Las apps de Google no verificadas solo pueden subir videos privados.
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

TOKEN_URL = os.environ.get("YT_TOKEN_URL", "https://oauth2.googleapis.com/token")
API_BASE = os.environ.get("YT_API_BASE", "https://www.googleapis.com")

CHUNK_SIZE = 8 * 1024 * 1024  # múltiplo de 256 KB, como exige la API
MAX_RETRIES = 5
SHORTS_MAX_SECONDS = 180
CATEGORY_EDUCATION = "27"


class UploadError(Exception):
    pass


def log(msg):
    print(msg, file=sys.stderr)


# ---------- credenciales ----------

def get_access_token():
    missing = [k for k in ("YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN") if not os.environ.get(k)]
    if missing:
        raise UploadError("Faltan variables de entorno: " + ", ".join(missing))
    body = urllib.parse.urlencode({
        "client_id": os.environ["YT_CLIENT_ID"],
        "client_secret": os.environ["YT_CLIENT_SECRET"],
        "refresh_token": os.environ["YT_REFRESH_TOKEN"],
        "grant_type": "refresh_token",
    }).encode()
    req = urllib.request.Request(TOKEN_URL, data=body, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.load(resp)["access_token"]
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")
        if "invalid_grant" in detail:
            raise UploadError(
                "El refresh token fue rechazado (invalid_grant). Si la app de Google está en modo "
                "'Prueba', el token vence a los 7 días: pásala a 'En producción' y genera uno nuevo."
            )
        raise UploadError(f"Error al renovar el token ({e.code}): {detail}")


def api_request(method, url, token, data=None, headers=None):
    hdrs = {"Authorization": f"Bearer {token}"}
    hdrs.update(headers or {})
    req = urllib.request.Request(url, data=data, method=method, headers=hdrs)
    return urllib.request.urlopen(req, timeout=120)


# ---------- validación del video ----------

def probe_video(path):
    """Devuelve (duración_s, ancho, alto) usando ffprobe, o None si no está disponible."""
    if not shutil.which("ffprobe"):
        return None
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height:format=duration", "-of", "json", path],
        capture_output=True, text=True,
    )
    if out.returncode != 0:
        raise UploadError(f"ffprobe no pudo leer el video: {out.stderr.strip()}")
    info = json.loads(out.stdout)
    stream = (info.get("streams") or [{}])[0]
    return float(info["format"]["duration"]), stream.get("width"), stream.get("height")


def validate_short(path):
    if not os.path.isfile(path):
        raise UploadError(f"No existe el archivo: {path}")
    probed = probe_video(path)
    if probed is None:
        log("Aviso: ffprobe no está instalado; no se validó duración ni formato.")
        return
    duration, width, height = probed
    log(f"Video: {duration:.1f} s, {width}x{height}")
    if duration > SHORTS_MAX_SECONDS:
        raise UploadError(f"Dura {duration:.0f} s; un Short puede durar como máximo {SHORTS_MAX_SECONDS} s.")
    if width and height and width > height:
        raise UploadError("El video es horizontal; un Short debe ser vertical (9:16) o cuadrado.")


# ---------- metadatos ----------

def build_metadata(args):
    meta = {}
    if args.meta:
        with open(args.meta, encoding="utf-8") as f:
            meta = json.load(f)
    # Los argumentos de línea de comandos tienen prioridad sobre el JSON.
    title = args.title or meta.get("title")
    if not title:
        raise UploadError("Falta el título (--title o \"title\" en el JSON).")
    if len(title) > 100:
        raise UploadError(f"El título tiene {len(title)} caracteres; el máximo es 100.")
    description = args.description if args.description is not None else meta.get("description", "")
    tags = args.tags.split(",") if args.tags else meta.get("tags", [])
    privacy = args.privacy or meta.get("privacy", "private")
    publish_at = args.publish_at or meta.get("publish_at")
    category = args.category or meta.get("category", CATEGORY_EDUCATION)
    made_for_kids = args.made_for_kids or meta.get("made_for_kids", False)
    synthetic = args.synthetic_media or meta.get("synthetic_media", False)

    if "#shorts" not in (title + " " + description).lower():
        description = (description + "\n\n#Shorts").strip()

    status = {
        "privacyStatus": privacy,
        "selfDeclaredMadeForKids": bool(made_for_kids),
        "embeddable": True,
    }
    if publish_at:
        try:
            when = datetime.fromisoformat(publish_at.replace("Z", "+00:00"))
        except ValueError:
            raise UploadError(f"Fecha inválida en --publish-at: {publish_at} (usa 2026-10-25T14:00:00Z)")
        if when.tzinfo is None:
            raise UploadError("--publish-at debe incluir zona horaria, por ejemplo 2026-10-25T14:00:00Z")
        if when <= datetime.now(timezone.utc):
            raise UploadError("--publish-at debe ser una fecha futura.")
        # La API solo acepta publicación programada en videos privados.
        status["privacyStatus"] = "private"
        status["publishAt"] = when.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    if synthetic:
        # Declaración de contenido alterado o sintético (voz o imágenes generadas con IA realistas).
        status["containsSyntheticMedia"] = True

    return {
        "snippet": {
            "title": title,
            "description": description,
            "tags": [t.strip() for t in tags if t.strip()],
            "categoryId": str(category),
            "defaultLanguage": meta.get("language", "es"),
            "defaultAudioLanguage": meta.get("language", "es"),
        },
        "status": status,
    }


# ---------- subida reanudable ----------

def start_upload(token, metadata, size):
    url = f"{API_BASE}/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status"
    body = json.dumps(metadata).encode()
    headers = {
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": "video/*",
        "X-Upload-Content-Length": str(size),
    }
    try:
        with api_request("POST", url, token, body, headers) as resp:
            location = resp.headers.get("Location")
    except urllib.error.HTTPError as e:
        raise UploadError(f"YouTube rechazó la subida ({e.code}): {e.read().decode(errors='replace')}")
    if not location:
        raise UploadError("YouTube no devolvió la URL de subida.")
    return location


def query_offset(token, session_url, size):
    """Pregunta cuántos bytes ya recibió YouTube (para reanudar tras un corte)."""
    headers = {"Content-Range": f"bytes */{size}", "Content-Length": "0"}
    try:
        with api_request("PUT", session_url, token, b"", headers) as resp:
            return size, json.load(resp)  # ya estaba completo
    except urllib.error.HTTPError as e:
        if e.code == 308:
            rng = e.headers.get("Range")
            return (int(rng.split("-")[1]) + 1 if rng else 0), None
        raise


def upload_file(token, session_url, path, size):
    offset, retries = 0, 0
    with open(path, "rb") as f:
        while offset < size:
            f.seek(offset)
            chunk = f.read(CHUNK_SIZE)
            end = offset + len(chunk) - 1
            headers = {"Content-Length": str(len(chunk)), "Content-Range": f"bytes {offset}-{end}/{size}"}
            try:
                with api_request("PUT", session_url, token, chunk, headers) as resp:
                    return json.load(resp)
            except urllib.error.HTTPError as e:
                if e.code == 308:
                    rng = e.headers.get("Range")
                    offset = int(rng.split("-")[1]) + 1 if rng else 0
                    retries = 0
                    log(f"  subido {offset * 100 // size}%")
                    continue
                if e.code not in (500, 502, 503, 504):
                    raise UploadError(f"Error durante la subida ({e.code}): {e.read().decode(errors='replace')}")
                err = f"HTTP {e.code}"
            except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
                err = str(e)
            retries += 1
            if retries > MAX_RETRIES:
                raise UploadError(f"La subida falló tras {MAX_RETRIES} reintentos: {err}")
            wait = 2 ** retries
            log(f"  {err}; reintento {retries}/{MAX_RETRIES} en {wait} s")
            time.sleep(wait)
            offset, done = query_offset(token, session_url, size)
            if done:
                return done
    raise UploadError("La subida terminó sin respuesta de YouTube.")


# ---------- comandos ----------

def check_credentials():
    token = get_access_token()
    url = f"{API_BASE}/youtube/v3/channels?part=snippet,statistics&mine=true"
    with api_request("GET", url, token) as resp:
        items = json.load(resp).get("items", [])
    if not items:
        raise UploadError("Las credenciales funcionan, pero esa cuenta de Google no tiene canal de YouTube.")
    ch = items[0]
    print(f"Conectado al canal: {ch['snippet']['title']} ({ch['id']})")
    print(f"Suscriptores: {ch['statistics'].get('subscriberCount', 'oculto')}")


def main():
    p = argparse.ArgumentParser(description="Sube un Short a YouTube (privado por defecto).")
    p.add_argument("video", nargs="?", help="Ruta del archivo de video (vertical, máximo 180 s)")
    p.add_argument("--check", action="store_true", help="Solo verifica las credenciales y muestra el canal")
    p.add_argument("--meta", help="JSON con title, description, tags, privacy, publish_at, ...")
    p.add_argument("--title")
    p.add_argument("--description")
    p.add_argument("--tags", help="Separadas por comas")
    p.add_argument("--privacy", choices=["private", "unlisted", "public"])
    p.add_argument("--publish-at", help="Publicación programada en ISO 8601, ej. 2026-10-25T14:00:00Z")
    p.add_argument("--category", help="ID de categoría (27 = Educación, por defecto)")
    p.add_argument("--made-for-kids", action="store_true",
                   help="Marca el video como 'para niños' (desactiva anuncios personalizados y comentarios)")
    p.add_argument("--synthetic-media", action="store_true",
                   help="Declara contenido realista generado o alterado con IA")
    p.add_argument("--dry-run", action="store_true", help="Valida video y metadatos sin subir nada")
    args = p.parse_args()

    try:
        if args.check:
            check_credentials()
            return 0
        if not args.video:
            p.error("indica el archivo de video o usa --check")
        validate_short(args.video)
        metadata = build_metadata(args)
        if args.dry_run:
            print(json.dumps(metadata, ensure_ascii=False, indent=2))
            log("Dry run: no se subió nada.")
            return 0
        size = os.path.getsize(args.video)
        token = get_access_token()
        log(f"Subiendo {args.video} ({size / 1e6:.1f} MB)...")
        session_url = start_upload(token, metadata, size)
        video = upload_file(token, session_url, args.video, size)
        vid = video["id"]
        print(json.dumps({
            "id": vid,
            "privacy": video.get("status", {}).get("privacyStatus"),
            "url": f"https://youtube.com/shorts/{vid}",
            "studio": f"https://studio.youtube.com/video/{vid}/edit",
        }, indent=2))
        return 0
    except UploadError as e:
        log(f"Error: {e}")
        return 1
    except urllib.error.HTTPError as e:
        log(f"Error de la API de YouTube ({e.code}): {e.read().decode(errors='replace')}")
        return 1
    except urllib.error.URLError as e:
        log(f"Error de conexión: {e.reason}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
