#!/usr/bin/env python3
"""Obtiene el YT_REFRESH_TOKEN. Ejecutar UNA vez en tu computador (abre el navegador).

  pip install google-auth-oauthlib
  YT_CLIENT_ID=... YT_CLIENT_SECRET=... python3 obtener_token.py

Guarda el token en las variables de entorno del entorno de Claude, nunca en el repositorio.
"""
import os

from google_auth_oauthlib.flow import InstalledAppFlow

flow = InstalledAppFlow.from_client_config(
    {"installed": {
        "client_id": os.environ["YT_CLIENT_ID"],
        "client_secret": os.environ["YT_CLIENT_SECRET"],
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": ["http://localhost"],
    }},
    scopes=[
        "https://www.googleapis.com/auth/youtube.upload",
        "https://www.googleapis.com/auth/youtube.readonly",
    ],
)
creds = flow.run_local_server(port=0, prompt="consent")
print("\nYT_REFRESH_TOKEN =", creds.refresh_token)
