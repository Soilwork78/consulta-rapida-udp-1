# shorts-pipeline

Herramientas para el canal de Shorts "Tu cuerpo es increíble". Independiente de la app Consulta Rápida.

## `subir_short.py`

Sube un Short a YouTube con la YouTube Data API v3. Solo usa la biblioteca estándar de Python 3 (y `ffprobe`, opcional, para validar el video).

### Credenciales

Se leen de variables de entorno. Nunca van en el código ni en el repositorio.

| Variable | Origen |
|---|---|
| `YT_CLIENT_ID` | Google Cloud → Credenciales → ID de cliente OAuth (App de escritorio) |
| `YT_CLIENT_SECRET` | El mismo cliente OAuth |
| `YT_REFRESH_TOKEN` | Script `obtener_token.py`, ejecutado una vez en tu computador |

La app de Google debe estar en estado **En producción**: en modo *Prueba*, el refresh token vence a los 7 días.

### Uso

```bash
# Verificar que las credenciales funcionan
python3 subir_short.py --check

# Validar video y metadatos sin subir nada
python3 subir_short.py video.mp4 --meta ejemplo_short.json --dry-run

# Subir (queda privado)
python3 subir_short.py video.mp4 --meta ejemplo_short.json

# Subir y programar la publicación (hora en UTC)
python3 subir_short.py video.mp4 --title "..." --publish-at 2026-10-25T14:00:00Z
```

Los argumentos de línea de comandos tienen prioridad sobre el JSON.

### Comportamiento

- **Privado por defecto.** Una app de Google no verificada solo puede subir videos privados; además, así cada Short se revisa en YouTube Studio antes de publicarlo.
- **Valida el Short:** máximo 180 s y formato vertical o cuadrado. Agrega `#Shorts` a la descripción si falta.
- **"Para niños" desactivado por defecto** (`selfDeclaredMadeForKids: false`). Usa `--made-for-kids` solo si el contenido está dirigido principalmente a menores de 13 años: desactiva los anuncios personalizados y los comentarios.
- **Declaración de IA:** `--synthetic-media` marca el video como contenido realista generado o alterado con IA.
- **Subida reanudable:** envía el archivo en bloques de 8 MB y reintenta hasta 5 veces ante errores transitorios, retomando desde el último byte confirmado.
- **Cuota:** la API da 10.000 unidades diarias por proyecto.
