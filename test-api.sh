#!/bin/bash

# 🧪 SCRIPT DE TESTE AUTOMÁTICO - RETELL MVP API
# Executa bateria completa de testes nos endpoints

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║           🧪 TESTE AUTOMÁTICO - RETELL MVP API            ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

API_URL="http://localhost:3000"
PASS=0
FAIL=0

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função de teste
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5
    
    echo -n "Testing $name... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (Status: $status_code)"
        ((PASS++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        echo "Response: $body"
        ((FAIL++))
        return 1
    fi
}

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}[1/8] Health Check${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

test_endpoint "Health Check" "GET" "/health" "" "200"

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}[2/8] Agents - List All${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

test_endpoint "List Agents" "GET" "/agents" "" "200"

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}[3/8] Agents - Create New${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

CREATE_DATA='{
  "name": "Test Agent",
  "type": "inbound",
  "systemPrompt": "You are a helpful assistant",
  "voiceId": "en-US-JennyNeural",
  "firstMessage": "Hello!"
}'

response=$(curl -s -X POST "$API_URL/agents" \
    -H "Content-Type: application/json" \
    -d "$CREATE_DATA")

AGENT_ID=$(echo "$response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$AGENT_ID" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Agent created with ID: $AGENT_ID"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC} - Failed to create agent"
    ((FAIL++))
fi

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}[4/8] Agents - Get by ID${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

if [ -n "$AGENT_ID" ]; then
    test_endpoint "Get Agent by ID" "GET" "/agents/$AGENT_ID" "" "200"
else
    echo -e "${YELLOW}⚠️  SKIP${NC} - No agent ID available"
fi

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}[5/8] Agents - Update${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

if [ -n "$AGENT_ID" ]; then
    UPDATE_DATA='{"name": "Updated Test Agent"}'
    test_endpoint "Update Agent" "PATCH" "/agents/$AGENT_ID" "$UPDATE_DATA" "200"
else
    echo -e "${YELLOW}⚠️  SKIP${NC} - No agent ID available"
fi

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}[6/8] Calls - List All${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

test_endpoint "List Calls" "GET" "/calls" "" "200"

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}[7/8] Calls - Analytics${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

test_endpoint "Calls Analytics" "GET" "/calls/analytics" "" "200"

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}[8/8] Agents - Archive${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

if [ -n "$AGENT_ID" ]; then
    test_endpoint "Archive Agent" "DELETE" "/agents/$AGENT_ID" "" "200"
else
    echo -e "${YELLOW}⚠️  SKIP${NC} - No agent ID available"
fi

# Resultados finais
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║                     📊 RESULTADOS                          ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

TOTAL=$((PASS + FAIL))
SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASS/$TOTAL)*100}")

echo -e "${GREEN}✅ Passed: $PASS${NC}"
echo -e "${RED}❌ Failed: $FAIL${NC}"
echo -e "${BLUE}📈 Success Rate: $SUCCESS_RATE%${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║         🎉 TODOS OS TESTES PASSARAM! API OK! 🎉           ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║                                                            ║${NC}"
    echo -e "${YELLOW}║      ⚠️  ALGUNS TESTES FALHARAM - VERIFICAR LOGS         ║${NC}"
    echo -e "${YELLOW}║                                                            ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
