#!/usr/bin/env bash
# Build a release zip for the Decky plugin store.
# Output: out/<name>-v<version>.zip
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ALLOW_DIRTY=0
for arg in "$@"; do
  case "$arg" in
    --allow-dirty) ALLOW_DIRTY=1 ;;
    -h | --help)
      echo "Usage: pnpm release [--allow-dirty]"
      echo "  --allow-dirty  Build even if tracked files changed."
      exit 0
      ;;
    *)
      echo "error: unknown option '$arg'" >&2
      exit 1
      ;;
  esac
done

fail() {
  echo "error: $1" >&2
  exit 1
}

CLI="$ROOT/cli/decky"
OUT_DIR="$ROOT/out"
CONTAINER_ENGINE="${CONTAINER_ENGINE:-podman}"

PLUGIN_NAME="$(node -p "require('./plugin.json').name")"
VERSION="$(node -p "require('./package.json').version")"
[[ -n "$PLUGIN_NAME" && -n "$VERSION" ]] || fail "cannot read the plugin name or the version"

CLI_ZIP="$OUT_DIR/$PLUGIN_NAME.zip"
RELEASE_ZIP="$OUT_DIR/$PLUGIN_NAME-v$VERSION.zip"

# --- Preflight -------------------------------------------------------------
echo "==> Preflight"

[[ -x "$CLI" ]] || fail "the Decky CLI is missing at $CLI. Run .vscode/setup.sh first."
command -v "$CONTAINER_ENGINE" >/dev/null 2>&1 ||
  fail "the container engine '$CONTAINER_ENGINE' is not installed. Set CONTAINER_ENGINE=docker to use Docker."
command -v python3 >/dev/null 2>&1 || fail "python3 is not installed."

# Only tracked files matter. Untracked build output (py_modules, out, dist) is expected.
if [[ "$ALLOW_DIRTY" -eq 0 ]]; then
  if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
    echo "The working tree contains changes:" >&2
    git status --short --untracked-files=no >&2
    fail "commit the changes, or use --allow-dirty."
  fi
fi

echo "    plugin:  $PLUGIN_NAME v$VERSION"
echo "    commit:  $(git rev-parse --short HEAD)"
echo "    engine:  $CONTAINER_ENGINE"

# --- Python dependencies ---------------------------------------------------
echo "==> Refreshing py_modules from requirements.txt"

rm -rf "$ROOT/py_modules"
mkdir -p "$ROOT/py_modules"
python3 -m pip install -r "$ROOT/requirements.txt" --target "$ROOT/py_modules" --no-compile --quiet

# --- Build -----------------------------------------------------------------
echo "==> Building the plugin zip"

mkdir -p "$OUT_DIR"
[[ -w "$OUT_DIR" ]] || fail "$OUT_DIR is not writable. Run: sudo chown -R \"\$(id -u):\$(id -g)\" \"$OUT_DIR\""
rm -f "$CLI_ZIP" "$RELEASE_ZIP"
"$CLI" plugin build \
  --engine "$CONTAINER_ENGINE" \
  --tmp-output-path "${TMPDIR:-/tmp}/decky" \
  --output-path "$OUT_DIR" \
  "$ROOT"

[[ -f "$CLI_ZIP" ]] || fail "the build did not produce $CLI_ZIP"
mv "$CLI_ZIP" "$RELEASE_ZIP"

# --- Check the archive -----------------------------------------------------
echo "==> Checking the archive"

CONTENTS="$(unzip -Z1 "$RELEASE_ZIP")"
for entry in \
  "$PLUGIN_NAME/main.py" \
  "$PLUGIN_NAME/plugin.json" \
  "$PLUGIN_NAME/package.json" \
  "$PLUGIN_NAME/LICENSE" \
  "$PLUGIN_NAME/README.md" \
  "$PLUGIN_NAME/dist/index.js" \
  "$PLUGIN_NAME/dist/index.js.map" \
  "$PLUGIN_NAME/py_modules/jeepney/__init__.py"; do
  grep -qxF "$entry" <<<"$CONTENTS" || fail "$entry is missing from the archive"
done

ZIP_VERSION="$(unzip -p "$RELEASE_ZIP" "$PLUGIN_NAME/package.json" | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).version")"
[[ "$ZIP_VERSION" == "$VERSION" ]] || fail "the archive reports version $ZIP_VERSION, not $VERSION"

echo
echo "Release build complete."
echo "  $RELEASE_ZIP ($(du -h "$RELEASE_ZIP" | cut -f1))"
