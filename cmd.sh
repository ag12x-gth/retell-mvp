#!/bin/bash
# ========================================
# ⚡ COMANDOS RÁPIDOS - RETELL MVP
# ========================================
# Atalhos para operações comuns
# ========================================

case "$1" in
    
    # ========================================
    # VALIDAR PROJETO
    # ========================================
    validar|check|test)
        echo "🧪 Validando projeto..."
        ./TESTE-LOCAL-VALIDACAO.sh
        ;;
    
    # ========================================
    # INSTALAR TUDO
    # ========================================
    instalar|install|setup)
        echo "📦 Instalando dependências..."
        npm install
        echo ""
        echo "🗄️  Configurando banco de dados..."
        npx prisma generate
        npx prisma migrate dev --name init
        npx tsx prisma/seed.ts
        echo ""
        echo "✅ Instalação completa!"
        ;;
    
    # ========================================
    # INICIAR SERVIDOR
    # ========================================
    start|iniciar|servidor)
        echo "🚀 Iniciando servidor..."
        npm run start:dev
        ;;
    
    # ========================================
    # CRIAR AGENTE
    # ========================================
    agente|agent|criar-agente)
        echo "🤖 Criando agente de vendas..."
        ./criar-agente-vendas.sh
        ;;
    
    # ========================================
    # FAZER LIGAÇÃO
    # ========================================
    ligar|call|ligacao)
        if [ -z "$2" ]; then
            echo "📞 Fazendo ligação com último agente..."
            ./fazer-ligacao.sh
        else
            echo "📞 Fazendo ligação com agente $2..."
            ./fazer-ligacao.sh "$2"
        fi
        ;;
    
    # ========================================
    # TESTAR API
    # ========================================
    api|testar-api|test-api)
        echo "🧪 Testando endpoints da API..."
        echo ""
        echo "Health Check:"
        curl -s http://localhost:3000/health | jq '.'
        echo ""
        echo "Config Status:"
        curl -s http://localhost:3000/config/status | jq '.'
        ;;
    
    # ========================================
    # VER LOGS
    # ========================================
    logs|log)
        echo "📋 Logs do servidor (Ctrl+C para sair):"
        tail -f app.log
        ;;
    
    # ========================================
    # ABRIR SWAGGER
    # ========================================
    swagger|docs|api-docs)
        echo "📖 Abrindo Swagger UI..."
        if command -v open > /dev/null 2>&1; then
            open http://localhost:3000/api
        elif command -v xdg-open > /dev/null 2>&1; then
            xdg-open http://localhost:3000/api
        else
            echo "Acesse: http://localhost:3000/api"
        fi
        ;;
    
    # ========================================
    # NGROK (WEBHOOKS)
    # ========================================
    ngrok|webhook|expor)
        if command -v ngrok > /dev/null 2>&1; then
            echo "🌐 Expondo aplicação com ngrok..."
            ngrok http 3000
        else
            echo "❌ ngrok não instalado"
            echo "Instale: brew install ngrok"
        fi
        ;;
    
    # ========================================
    # LIMPAR E REINSTALAR
    # ========================================
    reset|limpar|clean)
        echo "🧹 Limpando projeto..."
        rm -rf node_modules package-lock.json
        rm -rf prisma/dev.db
        echo ""
        echo "📦 Reinstalando..."
        npm install
        npx prisma generate
        npx prisma migrate dev --name init
        npx tsx prisma/seed.ts
        echo ""
        echo "✅ Projeto limpo e reinstalado!"
        ;;
    
    # ========================================
    # BANCO DE DADOS
    # ========================================
    db|database|banco)
        case "$2" in
            studio)
                echo "🗄️  Abrindo Prisma Studio..."
                npx prisma studio
                ;;
            reset)
                echo "🗄️  Resetando banco de dados..."
                npx prisma migrate reset
                ;;
            seed)
                echo "🌱 Populando banco com dados..."
                npx tsx prisma/seed.ts
                ;;
            *)
                echo "Uso: $0 db [studio|reset|seed]"
                ;;
        esac
        ;;
    
    # ========================================
    # HELP
    # ========================================
    help|ajuda|--help|-h)
        cat << 'HELP'
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           ⚡ COMANDOS RÁPIDOS - RETELL MVP ⚡                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

🔧 SETUP E INSTALAÇÃO:
  ./cmd.sh instalar         - Instalar tudo (npm + prisma)
  ./cmd.sh validar          - Validar projeto completo
  ./cmd.sh reset            - Limpar e reinstalar

🚀 EXECUÇÃO:
  ./cmd.sh start            - Iniciar servidor
  ./cmd.sh agente           - Criar agente de vendas
  ./cmd.sh ligar [agent_id] - Fazer ligação de teste

🧪 TESTES:
  ./cmd.sh api              - Testar endpoints
  ./cmd.sh logs             - Ver logs em tempo real

🌐 WEBHOOKS:
  ./cmd.sh ngrok            - Expor com ngrok
  ./cmd.sh swagger          - Abrir Swagger UI

🗄️  BANCO DE DADOS:
  ./cmd.sh db studio        - Abrir Prisma Studio
  ./cmd.sh db reset         - Resetar banco
  ./cmd.sh db seed          - Popular dados

📚 DOCUMENTAÇÃO:
  ./cmd.sh help             - Esta ajuda

══════════════════════════════════════════════════════════════

Exemplos:

  # Fluxo completo
  ./cmd.sh instalar
  ./cmd.sh start &
  ./cmd.sh agente
  ./cmd.sh ligar

  # Testes
  ./cmd.sh validar
  ./cmd.sh api

  # Desenvolvimento
  ./cmd.sh logs
  ./cmd.sh swagger
  ./cmd.sh ngrok

══════════════════════════════════════════════════════════════
HELP
        ;;
    
    # ========================================
    # DEFAULT
    # ========================================
    *)
        echo "❌ Comando não reconhecido: $1"
        echo ""
        echo "Use: ./cmd.sh help"
        echo ""
        echo "Comandos disponíveis:"
        echo "  instalar, start, agente, ligar, api, logs, swagger, ngrok"
        exit 1
        ;;
esac
