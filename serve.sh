#!/usr/bin/env bash
set -euo pipefail

bundle exec jekyll serve --port "${JEKYLL_PORT:-4001}"
