# ELI MCP Server

HTTP API wrapper dla api.sejm.gov.pl/eli - dostęp do polskich aktów prawnych.

## 🎯 Cel

Serwer proxy umożliwiający dostęp do ELI API z aplikacji najakiejpodstawie.pl, omijając blokadę IP dla serverless (Supabase Edge Functions).

## 🏗️ Architektura

```
Frontend (Vercel)
    ↓
Supabase Edge Function
    ↓ HTTPS + API Key
ELI MCP Server (Raspberry Pi / VPS)
    ↓ HTTP
api.sejm.gov.pl/eli
```

## 📦 Stack

- **Runtime**: Deno 2.x
- **Framework**: Deno native HTTP server
- **Cache**: In-memory LRU (configurable TTL)
- **Auth**: Bearer token (API key)

## 🚀 Quick Start

### Wymagania
- Deno 2.x
- Dostęp do internetu (port 443 wychodzący do api.sejm.gov.pl)

### Instalacja

```bash
# Sklonuj repo
git clone https://github.com/karolpolikarp/najakiejpodstawie.git
cd najakiejpodstawie/eli-mcp-server

# Utwórz .env
cp .env.example .env
nano .env  # Ustaw PORT i API_KEY

# Test połączenia z ELI API
deno task test

# Uruchom serwer
deno task start
```

## 🔧 Konfiguracja

Plik `.env`:

```env
PORT=8080              # Port HTTP serwera
API_KEY=secret-key     # API key dla autoryzacji
CACHE_TTL=3600         # TTL cache w sekundach
```

## 📡 API Endpoints

### Health Check
```bash
GET /health
# Nie wymaga autoryzacji
# Response: {"status":"ok","version":"1.0.0","timestamp":"..."}
```

### Search Acts
```bash
POST /tools/search_acts
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "title": "konstytucja",
  "inForce": true,
  "limit": 10
}
```

### Get Article
```bash
POST /tools/get_article
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "articleNumber": "533",
  "actCode": "kc"
}

# Znane kody aktów:
# kc, kodeks cywilny
# kp, kodeks pracy
# kk, kodeks karny
# kpk, kodeks postępowania karnego
# kpc, kodeks postępowania cywilnego
# konstytucja
```

### Get Act Details
```bash
POST /tools/get_act_details
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "publisher": "DU",
  "year": 1964,
  "position": 16
}
```

## 🔒 Security

- ✅ API Key authentication (Bearer token)
- ✅ CORS headers (configurable origin)
- ✅ No user data storage
- ✅ Rate limiting przez cache (duplicate requests)

## 📊 Monitoring

```bash
# Sprawdź czy działa
curl http://localhost:8080/health

# Logi
deno task dev  # Watch mode z logami
```

## 🌐 Deployment

Szczegółowe instrukcje w [DEPLOYMENT.md](./DEPLOYMENT.md):

- **Raspberry Pi + Cloudflare Tunnel** (REKOMENDOWANE)
- **Mikrus FROG** (darmowy VPS)
- **Docker** (opcjonalnie)

## 🧪 Testing

```bash
# Test połączenia z ELI API
deno task test

# Powinno zwrócić:
# ✅ Test 1: GET /acts - SUCCESS
# ✅ Test 2: GET /acts/search - SUCCESS
# ✅ Test 3: GET /acts/DU/1964/16 - SUCCESS
# ✅ Test 4: GET /acts/.../text.html - SUCCESS
```

## 🐛 Troubleshooting

### "Access denied" z ELI API

**Problem**: IP serwera jest zablokowany przez api.sejm.gov.pl

**Rozwiązanie**:
1. Użyj Raspberry Pi (domowe IP - zazwyczaj nie blokowane)
2. Użyj VPS z Polski (OVH, Home.pl)
3. Skontaktuj się z api.sejm.gov.pl o whitelist

### Wolne odpowiedzi

**Problem**: Brak cache lub mały TTL

**Rozwiązanie**: Zwiększ `CACHE_TTL` w `.env` (np. 7200 = 2h)

## 📝 License

MIT - zgodnie z głównym projektem najakiejpodstawie

## 🙏 Credits

Bazowane na OpenAPI spec z https://api.sejm.gov.pl/eli_pl.html
