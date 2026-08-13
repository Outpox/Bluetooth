#!/usr/bin/env bash
CLI_LOCATION="$(pwd)/cli"
CONTAINER_ENGINE="${CONTAINER_ENGINE:-podman}"
echo "Building plugin in $(pwd) with $CONTAINER_ENGINE"
"$CLI_LOCATION/decky" plugin build --engine "$CONTAINER_ENGINE" --tmp-output-path "$TMPDIR/decky" "$(pwd)"
