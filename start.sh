#!/usr/bin/env bash
# =============================================================
# Matcha — Script de démarrage
# =============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

STEP=0
step() {
  STEP=$((STEP + 1))
  echo -e "\n${CYAN}${BOLD}[${STEP}]${NC} ${BOLD}$1${NC}"
}
ok()   { echo -e "    ${GREEN}✓${NC} $1"; }
warn() { echo -e "    ${YELLOW}⚠${NC}  $1"; }
err()  { echo -e "    ${RED}✗${NC} $1"; }

echo -e "\n${BOLD}♡  Matcha — Lancement de l'application${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Prérequis ────────────────────────────────────────────────
step "Vérification des prérequis"

if ! command -v node &>/dev/null; then
  err "Node.js n'est pas installé. Téléchargez-le sur https://nodejs.org"
  exit 1
fi
NODE_VER=$(node -v)
ok "Node.js $NODE_VER"

if ! command -v npm &>/dev/null; then
  err "npm n'est pas disponible"
  exit 1
fi
ok "npm $(npm -v)"

# ── Fichier .env ─────────────────────────────────────────────
step "Vérification du fichier .env"

if [ ! -f ".env" ]; then
  warn ".env introuvable — copie depuis .env.example..."
  cp .env.example .env
  warn "Pensez à renseigner vos identifiants MySQL et votre JWT_SECRET dans .env"
else
  ok ".env présent"
fi

# Vérifier JWT_SECRET
if grep -q "JWT_SECRET=$" .env || grep -q "JWT_SECRET=change_this" .env; then
  warn "JWT_SECRET semble être vide ou par défaut. Modifiez-le dans .env pour la production."
fi

# ── Dépendances backend ───────────────────────────────────────
step "Installation des dépendances backend"

if [ ! -d "node_modules" ]; then
  echo "    Installation en cours..."
  npm install --silent
  ok "Dépendances backend installées"
else
  ok "node_modules backend déjà présent"
fi

# ── Dépendances frontend ──────────────────────────────────────
step "Installation des dépendances frontend"

if [ ! -d "client/node_modules" ]; then
  echo "    Installation en cours..."
  npm install --prefix client --silent
  ok "Dépendances frontend installées"
else
  ok "node_modules frontend déjà présent"
fi

# ── Migration SQL ─────────────────────────────────────────────
step "Base de données"

echo -e "    ${YELLOW}Action requise :${NC} si c'est la première fois, exécutez la migration :"
echo -e "    ${CYAN}mysql -u <user> -p < database/migration.sql${NC}"
echo -e "    (ignorez si déjà fait)"

# ── Lancement ─────────────────────────────────────────────────
step "Démarrage des serveurs"

echo ""
echo -e "  ${GREEN}API  →${NC} http://localhost:3000"
echo -e "  ${CYAN}App  →${NC} http://localhost:5173"
echo ""
echo -e "  Appuyez sur ${BOLD}Ctrl+C${NC} pour tout arrêter."
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"

npm run dev:all
