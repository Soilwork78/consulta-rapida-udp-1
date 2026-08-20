# Skills y plugins de este proyecto

Registro de qué se instaló, desde dónde, y qué quedó pendiente de
instalar a mano porque no son skills copiables sino plugins.

## Instalado en este repo (`.claude/skills/`)

Se cargan solas en cualquier sesión de Claude Code abierta sobre este
repositorio. No requieren instalar nada más.

| Skill | Origen | Licencia |
| --- | --- | --- |
| 46 skills `omni-*` / `cli-*` / `config-codex-cli` / `ponytail` | [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) `skills/` | MIT |
| `task-observer` (+ `references/`) | [rebelytics/one-skill-to-rule-them-all](https://github.com/rebelytics/one-skill-to-rule-them-all) | CC BY 4.0 |
| `claude-automation-recommender` (+ `references/`) | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) → `plugins/claude-code-setup` | Apache-2.0 |

Notas:

- **task-observer** escribe un log de observaciones en disco. Busca una
  ruta estable (`~/.claude/projects/<id>/skill-observations/log.md`), no
  el cwd. En un contenedor efímero el log no sobrevive a la sesión.
- **claude-automation-recommender** es de solo lectura: analiza el
  código y recomienda automatizaciones, no modifica archivos.

## NO instalado: requieren instalación como plugin

Estos dos no son skills copiables. Traen hooks que ejecutan código en
cada sesión y en cada uso de herramienta, más servicios propios, así que
hay que instalarlos desde tu Claude Code local (no desde un contenedor
remoto efímero como este).

### Claude Mem — https://github.com/thedotmack/claude-mem

Sistema de memoria persistente entre sesiones. Trae 19 skills
(`mem-search`, `standup`, `learn-codebase`, `make-plan`, `babysit`...),
pero dependen de su servidor MCP y de un worker en segundo plano;
copiarlas sueltas no funciona.

```bash
# dentro de Claude Code
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
# reiniciar Claude Code
```

O bien, desde la terminal: `npx claude-mem install`

Ojo: `npm install -g claude-mem` instala solo la librería, no registra
los hooks ni el worker.

Hooks que registra: `Setup`, `SessionStart`, `UserPromptSubmit`,
`PostToolUse` (en `*`, es decir en cada herramienta). Comprime y guarda
el contenido de las sesiones. Licencia Apache-2.0.

### Headroom — https://github.com/headroomlabs-ai/headroom

Capa de compresión de contexto (60–95% menos tokens en JSON, 15–20% en
agentes de código). No contiene ninguna skill: es una librería/proxy/MCP
en Python + Rust, más un plugin de hooks `headroom-agent-hooks`.

```bash
pip install headroom-ai      # o: npm install -g headroom-ai

# dentro de Claude Code
/plugin marketplace add headroomlabs-ai/headroom
/plugin install headroom
```

Licencia Apache-2.0. Docs: https://headroom-docs.vercel.app/docs

### Claude Code Setup — plugin oficial

La skill ya está copiada arriba, pero si prefieres la instalación
oficial (recibe actualizaciones automáticas):

```bash
/plugin marketplace add anthropics/claude-plugins-official
/plugin install claude-code-setup
```

Página oficial: https://claude.com/plugins/claude-code-setup
