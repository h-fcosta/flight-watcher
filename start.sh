#!/bin/bash

# Script de inicialização do Flight Watcher
# Uso: ./start.sh [web|cli]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛫 Flight Watcher - Sistema de Monitoramento de Voos${NC}"
echo "=================================================="

# Verificar se o ambiente virtual existe
if [ ! -d ".venv" ]; then
    echo -e "${RED}❌ Ambiente virtual não encontrado${NC}"
    echo "Execute: python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Verificar se as dependências estão instaladas
if ! .venv/bin/python -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Instalando dependências...${NC}"
    .venv/bin/pip install -r requirements.txt
fi

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
    echo "Copiando .env.example para .env..."
    cp .env.example .env
    echo -e "${RED}❌ Configure suas credenciais no arquivo .env antes de continuar${NC}"
    exit 1
fi

# Verificar se as configurações mínimas estão definidas
if ! grep -q "AMADEUS_" .env; then
    echo -e "${RED}❌ Configure as credenciais da API Amadeus no arquivo .env${NC}"
    exit 1
fi

# Modo de execução
MODE=${1:-web}

case $MODE in
    "web")
        echo -e "${GREEN}🌐 Iniciando interface web...${NC}"
        echo "Acesse: http://localhost:8000"
        echo "API Docs: http://localhost:8000/docs"
        echo ""
        echo -e "${YELLOW}Pressione Ctrl+C para parar${NC}"
        .venv/bin/python main_api.py
        ;;
    "cli")
        echo -e "${GREEN}💻 Iniciando modo linha de comando...${NC}"
        echo -e "${YELLOW}Pressione Ctrl+C para parar${NC}"
        .venv/bin/python main.py
        ;;
    *)
        echo "Uso: $0 [web|cli]"
        echo "  web - Interface web (padrão)"
        echo "  cli - Linha de comando"
        exit 1
        ;;
esac
