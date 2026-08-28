# Release Scripts

Scripts automatizados para gestionar el ciclo de vida de releases del proyecto.

## 📋 Tabla de Contenidos

- [Prerequisitos](#prerequisitos)
- [Scripts Disponibles](#scripts-disponibles)
- [Flujo de Trabajo Completo](#flujo-de-trabajo-completo)
- [Ejemplos de Uso](#ejemplos-de-uso)

## 🔧 Prerequisitos

### 1. GitHub CLI (gh)

Para crear releases en GitHub automáticamente:

```bash
# macOS
brew install gh

# Linux
# Ver: https://github.com/cli/cli/blob/trunk/docs/install_linux.md

# Autenticarse
gh auth login
```

### 2. npm Authentication

Para publicar en npm:

```bash
npm login
```

## 📜 Scripts Disponibles

### 1. `changelog.ts` - Generar Changelog

Genera o actualiza el `CHANGELOG.md` basándose en los commits de git con formato convencional.

```bash
# Generar changelog desde el último tag
bun run changelog

# Generar desde un tag específico
bun scripts/changelog.ts --from v1.0.0

# Generar hasta un punto específico
bun scripts/changelog.ts --from v1.0.0 --to HEAD
```

**Formato de commits soportado:**
```
<type>(<scope>): <subject>

feat(user): add new user service method
fix(auth): correct token validation
docs: update README
```

**Tipos reconocidos:**
- `feat` ✨ - Nueva funcionalidad
- `fix` 🐛 - Corrección de bugs
- `docs` 📚 - Documentación
- `refactor` ♻️ - Refactorización
- `perf` ⚡ - Mejoras de rendimiento
- `test` ✅ - Tests
- `build` 🏗️ - Sistema de build
- `ci` 👷 - CI/CD
- `chore` 🔧 - Tareas de mantenimiento

### 2. `github-release.ts` - Crear Release en GitHub

Crea un release en GitHub con las notas del changelog.

```bash
# Usar la versión de package.json
bun run gh:release

# Especificar versión
bun scripts/github-release.ts v2.0.0

# Marcar como prerelease
bun scripts/github-release.ts --prerelease
```

**Requiere:**
- Git tag ya creado
- GitHub CLI autenticado
- CHANGELOG.md actualizado

### 3. `release.ts` - Flujo Completo de Release

Script todo-en-uno que automatiza el proceso completo de release.

```bash
# Release patch (1.0.0 -> 1.0.1)
bun run release:patch

# Release minor (1.0.0 -> 1.1.0)
bun run release:minor

# Release major (1.0.0 -> 2.0.0)
bun run release:major

# Release alpha (1.0.0 -> 1.0.1-alpha.0)
bun run release:alpha

# Release beta (1.0.0 -> 1.0.1-beta.0)
bun run release:beta

# O directamente
bun scripts/release.ts <patch|minor|major|alpha|beta>
```

**El script ejecuta:**
1. ✅ Verifica que el directorio de trabajo esté limpio
2. ✅ Ejecuta los tests (`bun test`)
3. ✅ Compila el proyecto (`bun run build`)
4. 📈 Incrementa la versión en `package.json`
5. 📝 Genera/actualiza `CHANGELOG.md`
6. 💾 Hace commit de los cambios
7. 🏷️ Crea git tag
8. 📦 Crea release en GitHub
9. 🚀 Publica en npm

## 🔄 Flujo de Trabajo Completo

### Opción 1: Release Automático (Recomendado)

```bash
# 1. Asegúrate de que todos los cambios estén commiteados
git status

# 2. Ejecuta el release completo
bun run release:patch  # o minor/major/alpha/beta

# 3. ¡Listo! El script hace todo automáticamente
```

### Opción 2: Manual (Paso a Paso)

```bash
# 1. Actualizar changelog
bun run changelog

# 2. Revisar y editar CHANGELOG.md si es necesario
# (el script genera automáticamente desde los commits)

# 3. Commit del changelog
git add CHANGELOG.md
git commit -m "docs: update changelog"

# 4. Bump version
npm version patch  # o minor/major

# 5. Build
bun run build

# 6. Crear release en GitHub
bun run gh:release

# 7. Publicar en npm
npm publish --access public
```

## 📝 Ejemplos de Uso

### Ejemplo 1: Release Patch de Corrección de Bugs

```bash
# Hiciste algunos commits con fixes:
# git commit -m "fix(user): correct getInfo error handling"
# git commit -m "fix(auth): validate session key properly"

# Crear release patch
bun run release:patch

# Resultado: 1.0.0 -> 1.0.1
```

### Ejemplo 2: Release Minor con Nueva Feature

```bash
# Añadiste una nueva funcionalidad:
# git commit -m "feat(album): add getTopTracks method"

# Crear release minor
bun run release:minor

# Resultado: 1.0.1 -> 1.1.0
```

### Ejemplo 3: Release Alpha para Testing

```bash
# Trabajando en cambios experimentales:
# git commit -m "feat(experimental): new caching layer"

# Crear release alpha
bun run release:alpha

# Resultado: 1.1.0 -> 1.1.1-alpha.0
# Se publica como: npm install @ansango/lastfm-api@alpha
```

### Ejemplo 4: Generar Changelog Manualmente

```bash
# Ver changelog desde el último release
bun run changelog

# Ver changelog desde v1.0.0
bun scripts/changelog.ts --from v1.0.0

# El changelog se actualiza en CHANGELOG.md
```

### Ejemplo 5: Crear Solo Release en GitHub

```bash
# Si ya tienes el tag creado y quieres solo el GitHub release
bun run gh:release

# Con versión específica
bun scripts/github-release.ts v2.0.0

# Como prerelease
bun scripts/github-release.ts v2.0.0-alpha.1 --prerelease
```

## 🎯 Mejores Prácticas

### 1. Commits Convencionales

Sigue el formato de commits convencionales para mejores changelogs:

```bash
# ✅ Bien
git commit -m "feat(user): add rate limiting"
git commit -m "fix(auth): correct token expiry check"
git commit -m "docs: update API examples"

# ❌ Mal
git commit -m "updates"
git commit -m "fix stuff"
```

### 2. Testing Antes de Release

Siempre ejecuta los tests antes de crear un release:

```bash
bun test
```

El script `release.ts` hace esto automáticamente.

### 3. Verificar Rama

Para releases estables (patch/minor/major), asegúrate de estar en `main`:

```bash
git checkout main
git pull origin main
```

Para prereleases (alpha/beta), puedes estar en cualquier rama.

### 4. Revisar el Changelog

Después de generar el changelog, revísalo y edítalo si es necesario antes de commitear:

```bash
bun run changelog
# Revisar CHANGELOG.md
# Editar si es necesario
git add CHANGELOG.md
git commit -m "docs: update changelog"
```

## 🔐 Variables de Entorno

No se requieren variables de entorno especiales. Los scripts usan:

- GitHub CLI para autenticación con GitHub
- npm credentials para publicación
- Git para versionado

## 🐛 Troubleshooting

### Error: "GitHub CLI not installed"

```bash
# Instala GitHub CLI
brew install gh  # macOS
# o sigue: https://cli.github.com/

# Autentica
gh auth login
```

### Error: "Not authenticated with GitHub"

```bash
gh auth login
# Sigue las instrucciones interactivas
```

### Error: "npm publish --access public failed"

```bash
# Asegúrate de estar logueado en npm
npm login

# Verifica el nombre del paquete en package.json
# Verifica que tengas permisos de publicación
```

### El changelog está vacío

Asegúrate de que tus commits siguen el formato convencional:

```bash
# Ver commits recientes
git log --oneline

# Si no siguen el formato, el changelog no los incluirá
```

## 📚 Recursos

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [GitHub CLI](https://cli.github.com/)
- [npm Documentation](https://docs.npmjs.com/)
