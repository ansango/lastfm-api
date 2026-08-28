# 🚀 Sistema de Release Automático

Sistema completo de automatización para releases del proyecto @ansango/lastfm-api.

## 📦 ¿Qué se ha añadido?

### 1. Scripts de Release (`scripts/`)

- **`changelog.ts`** - Genera changelog automático desde commits
- **`github-release.ts`** - Crea releases en GitHub
- **`release.ts`** - Workflow completo de release
- **`README.md`** - Documentación completa de los scripts

### 2. Comandos npm Actualizados

```json
{
  "scripts": {
    "build": "rimraf dist && tsc",
    "clean": "rimraf dist",
    "dev": "bun run clean && tsc --watch --project tsconfig.dev.json",
    "test": "bun test",
    "prepublishOnly": "bun run build",
    "changelog": "bun scripts/changelog.ts",
    "release": "bun scripts/release.ts",
    "release:patch": "bun scripts/release.ts patch",
    "release:minor": "bun scripts/release.ts minor",
    "release:major": "bun scripts/release.ts major",
    "release:alpha": "bun scripts/release.ts alpha",
    "release:beta": "bun scripts/release.ts beta",
    "gh:release": "bun scripts/github-release.ts"
  }
}
```

### 3. Archivos Actualizados

- **`package.json`** - Nuevos scripts de release
- **`.npmignore`** - Mejorado para excluir archivos innecesarios
- **`README.md`** - Sección de contribución y release actualizada
- **`CHANGELOG.md`** - Actualizado automáticamente

## 🎯 Uso Rápido

### Release Automático (Recomendado)

```bash
# Release patch (bug fixes)
bun run release:patch

# Release minor (new features)
bun run release:minor

# Release major (breaking changes)
bun run release:major

# Prerelease alpha/beta
bun run release:alpha
bun run release:beta
```

### Manual (Paso a Paso)

```bash
# 1. Generar changelog
bun run changelog

# 2. Crear release en GitHub
bun run gh:release

# 3. Publicar en npm
npm publish --access public
```

## ✅ El script automático hace:

1. ✅ **Valida** el directorio de trabajo limpio
2. ✅ **Ejecuta tests** (`bun test`)
3. ✅ **Compila** el proyecto
4. 📈 **Incrementa versión** en package.json
5. 📝 **Genera changelog** desde commits
6. 💾 **Commitea** los cambios
7. 🏷️ **Crea git tag**
8. 📦 **Crea GitHub release**
9. 🚀 **Publica en npm**

## 📋 Prerequisitos

### 1. GitHub CLI

```bash
# Instalar
brew install gh  # macOS

# Autenticar
gh auth login
```

### 2. npm Authentication

```bash
npm login
```

### 3. Commits Convencionales

Usa formato de commits convencionales:

```bash
feat(user): add new method
fix(auth): correct validation
docs: update README
refactor: improve performance
```

## 📝 Ejemplo Completo de Release

```bash
# 1. Desarrollas y haces commits
git commit -m "feat(track): add scrobble support"
git commit -m "fix(album): correct search params"
git commit -m "docs: update examples"

# 2. Ejecutas el release
bun run release:minor

# El script pregunta confirmación
# ❓ Proceed with release? (yes/no): yes

# 3. El script hace todo automáticamente:
# ✅ Running tests...
# ✅ Building project...
# ✅ Generating changelog...
# ✅ Committing changes...
# ✅ Creating GitHub release...
# ✅ Publishing to npm...

# 4. ¡Listo!
# 📦 Version 1.1.0 has been released!
# 🔗 https://github.com/ansango/lastfm-api/releases/tag/v1.1.0
# 📦 https://www.npmjs.com/package/@ansango/lastfm-api
```

## 🎨 Características

### Changelog Automático

El changelog se genera automáticamente desde los commits:

```markdown
## [1.1.0] - 2025-11-05

### ✨ Features

- **track**: add scrobble support ([abc123])
- **album**: improve search functionality ([def456])

### 🐛 Bug Fixes

- **album**: correct search params ([ghi789])

### 📚 Documentation

- update examples ([jkl012])
```

### Versionado Semántico

- **patch** (1.0.0 → 1.0.1): Bug fixes
- **minor** (1.0.0 → 1.1.0): New features
- **major** (1.0.0 → 2.0.0): Breaking changes
- **alpha** (1.0.0 → 1.0.1-alpha.0): Prereleases
- **beta** (1.0.0 → 1.0.1-beta.0): Prereleases

### GitHub Release

Automáticamente crea un release en GitHub con:
- Tag de versión
- Notas del changelog
- Marca de prerelease (si aplica)

### npm Publishing

Publica en npm con el tag correcto:
- `latest` para releases estables
- `alpha` para alphas
- `beta` para betas

## 📚 Documentación Completa

Ver [scripts/README.md](scripts/README.md) para documentación detallada.

## 🔒 Seguridad

- No se requieren tokens en el código
- Usa GitHub CLI para autenticación
- Usa npm credentials locales
- No expone secretos

## 🐛 Troubleshooting

### "GitHub CLI not installed"

```bash
brew install gh
gh auth login
```

### "Not authenticated with GitHub"

```bash
gh auth login
```

### "Working directory is not clean"

```bash
git status
git add .
git commit -m "chore: prepare release"
```

### El changelog está vacío

Asegúrate de usar commits convencionales:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: correct bug"
```

## 💡 Tips

1. **Usa commits convencionales** para changelogs automáticos
2. **Ejecuta tests** antes de release (el script lo hace)
3. **Revisa el changelog** generado antes de confirmar
4. **Haz releases frecuentes** para mantener el proyecto actualizado
5. **Usa prereleases** (alpha/beta) para testing

## 🎉 ¡Listo para Usar!

El sistema está completamente configurado y listo para crear releases profesionales con un solo comando.

```bash
bun run release:patch
```

¡Y ya está! 🚀
