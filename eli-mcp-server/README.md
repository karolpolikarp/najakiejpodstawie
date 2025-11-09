# ELI MCP Server

HTTP API serwer dla dostępu do polskich aktów prawnych poprzez [ELI API](https://api.sejm.gov.pl/eli).

## 🎯 Co to robi?

Prosty MCP (Model Context Protocol) server, który:
- Łączy się z oficjalnym API sejm.gov.pl (ELI)
- Udostępnia narzędzia do wyszukiwania aktów prawnych
- Pobiera konkretne artykuły z kodeksów (KC, KP, KK, itp.)
- Cache'uje wyniki dla szybszych odpowiedzi
- Zabezpiecza dostęp przez API key

## ⚡ Quick Start

### 1. Test czy ELI API działa z Twojego IP

**NAJPIERW sprawdź czy api.sejm.gov.pl nie blokuje Twojego IP!**

```bash
# Na Raspberry Pi / lokalnej maszynie:
bash test-from-home.sh

# LUB prosty test:
curl -I https://api.sejm.gov.pl/eli/acts
```

Jeśli dostaniesz `HTTP/2 200` - możesz kontynuować! ✅
Jeśli `Access denied` - Twoje IP jest zablokowane ❌

### 2. Instalacja

```bash
# Zainstaluj Deno
curl -fsSL https://deno.land/install.sh | sh

# Sklonuj repo
git clone https://github.com/[your-username]/najakiejpodstawie.git
cd najakiejpodstawie/eli-mcp-server

# Utwórz .env
cp .env.example .env
nano .env  # Ustaw PORT i API_KEY

# Uruchom serwer
deno task start
```

### 3. Test

```bash
# Health check
curl http://localhost:8080/health

# Wyszukaj akty
curl -X POST http://localhost:8080/tools/search_acts \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"title":"kodeks cywilny","limit":5}'

# Pobierz konkretny artykuł
curl -X POST http://localhost:8080/tools/get_article \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"articleNumber":"533","actCode":"kc"}'
```

## 📚 Dostępne narzędzia

### `POST /tools/search_acts`

Wyszukaj akty prawne po słowach kluczowych.

**Request:**
```json
{
  "title": "kodeks cywilny",
  "inForce": true,
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "totalCount": 145,
  "acts": [
    {
      "eli": "DU/1964/16",
      "title": "Ustawa z dnia 23 kwietnia 1964 r. - Kodeks cywilny",
      "displayAddress": "Dz.U. 1964 Nr 16 poz. 93",
      "publisher": "DU",
      "year": 1964,
      "position": 16,
      "status": "obowiązujący",
      "hasHTML": true,
      "hasPDF": true
    }
  ]
}
```

### `POST /tools/get_article`

Pobierz konkretny artykuł z aktu prawnego.

**Request:**
```json
{
  "articleNumber": "533",
  "actCode": "kc"
}
```

**Obsługiwane kody aktów:**
- `kc` / `kodeks cywilny` → Kodeks cywilny
- `kp` / `kodeks pracy` → Kodeks pracy
- `kk` / `kodeks karny` → Kodeks karny
- `kpk` → Kodeks postępowania karnego
- `kpc` → Kodeks postępowania cywilnego
- `konstytucja` → Konstytucja RP

**Response:**
```json
{
  "success": true,
  "act": {
    "title": "Kodeks cywilny",
    "displayAddress": "Dz.U. 1964 Nr 16 poz. 93",
    "eli": "DU/1964/16"
  },
  "article": {
    "number": "533",
    "text": "§ 1. Sprzedawca obowiązany jest do wydania kupującemu rzeczy sprzedanej..."
  },
  "isapLink": "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640000016"
}
```

### `POST /tools/get_act_details`

Pobierz szczegóły konkretnego aktu.

**Request:**
```json
{
  "publisher": "DU",
  "year": 1964,
  "position": 16
}
```

## 🚀 Deployment

Wybierz platformę:

- **[Raspberry Pi](DEPLOYMENT-RPI.md)** ⭐ REKOMENDOWANE
  - 0 PLN/m (tylko prąd)
  - Cloudflare Tunnel (darmowy HTTPS)
  - Pełna kontrola
  - IP domowe (prawdopodobnie NIE blokowane)

- **[Mikrus FROG](DEPLOYMENT.md)** 💰 NAJTAŃSZE
  - 0 PLN/m (po 5 PLN aktywacji)
  - 256MB RAM (wystarczy)
  - Darmowa subdomena wykr.es
  - Może być zablokowane przez sejm.gov.pl

- **VPS (OVH, Hetzner)**
  - ~200-300 PLN/rok
  - Gwarantowany uptime
  - Może być zablokowane przez sejm.gov.pl

## 🔒 Bezpieczeństwo

- **API Key**: Wszystkie endpointy (oprócz `/health`) wymagają `Authorization: Bearer <key>`
- **CORS**: Skonfigurowany dla Supabase Edge Functions
- **Cache**: In-memory cache z TTL (domyślnie 1h)
- **Rate limiting**: TODO (dodaj jeśli potrzeba)

## 🧪 Rozwój

```bash
# Uruchom w trybie dev (auto-reload)
deno task dev

# Uruchom testy
deno task test

# Format kodu
deno fmt

# Lint
deno lint
```

## 📝 Struktura projektu

```
eli-mcp-server/
├── src/
│   ├── server.ts       # Główny HTTP server
│   ├── eli-client.ts   # Klient ELI API
│   ├── tools.ts        # High-level narzędzia
│   └── test-eli.ts     # Test script
├── deno.json           # Konfiguracja Deno
├── .env.example        # Przykładowa konfiguracja
├── README.md           # Ten plik
├── DEPLOYMENT.md       # Deployment na Mikrus FROG
├── DEPLOYMENT-RPI.md   # Deployment na Raspberry Pi
└── test-from-home.sh   # Test skrypt dla domowego IP
```

## 🤝 Integracja z Supabase Edge Function

W Supabase dodaj zmienne środowiskowe:

```bash
MCP_SERVER_URL=https://twoja-domena.pl
MCP_API_KEY=twoj-super-tajny-klucz
```

Następnie w Edge Function:

```typescript
const mcpUrl = Deno.env.get('MCP_SERVER_URL');
const mcpKey = Deno.env.get('MCP_API_KEY');

const response = await fetch(`${mcpUrl}/tools/get_article`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${mcpKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    articleNumber: '533',
    actCode: 'kc',
  }),
});

const result = await response.json();
console.log(result.article.text);
```

## 🐛 Troubleshooting

### "Access denied" z ELI API

Twoje IP (lub IP serwera) jest zablokowane przez api.sejm.gov.pl.

**Rozwiązania:**
1. Użyj Raspberry Pi z domowym IP (prawdopodobnie nie blokowane)
2. Spróbuj innego VPS
3. Skontaktuj się z api.sejm.gov.pl o whitelist
4. Rozważ alternatywne rozwiązanie (scraping + RAG)

### Serwer nie startuje

```bash
# Sprawdź logi
deno task start

# Sprawdź czy port jest zajęty
netstat -tulpn | grep 8080

# Sprawdź .env
cat .env
```

## 📜 Licencja

MIT - używaj swobodnie!

## 🙏 Credits

- ELI API: https://api.sejm.gov.pl/eli
- OpenAPI spec: https://api.sejm.gov.pl/eli_pl.html
- Inspiracja: [sejm-mcp](https://github.com/janisz/sejm-mcp) (Go implementation)
