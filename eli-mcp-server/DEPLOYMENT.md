# Deployment Guide - ELI MCP Server

## ⚠️ WAŻNE: Problem z lokalną siecią

Jeśli Twój Raspberry Pi jest w lokalnej sieci (adres `192.168.x.x`), Supabase Edge Functions **NIE MAJĄ** do niego dostępu!

```
❌ NIE ZADZIAŁA:
Supabase (chmura) → http://192.168.0.9:8080 → Raspberry Pi (lokalna sieć)
```

**Rozwiązanie:** Deploy do chmury lub użyj tunelu.

---

## 🚀 Opcja 1: Deno Deploy (POLECAM - najprostsze!)

### Kroki:

**1. Zainstaluj deployctl:**
```bash
deno install --allow-read --allow-write --allow-env --allow-net --allow-run --no-check -r -f https://deno.land/x/deploy/deployctl.ts
```

**2. Zaloguj się:**
```bash
deployctl login
```

**3. Deploy:**
```bash
cd ~/najakiejpodstawie/eli-mcp-server
deno task deploy
```

**4. Otrzymasz URL:**
```
✅ https://eli-mcp-prod-xyz123.deno.dev
```

**5. Ustaw env w Deno Deploy:**
- Wejdź: https://dash.deno.com/projects/eli-mcp-prod/settings
- Dodaj: `ELI_API_KEY = dev-secret-key`

**6. Test:**
```bash
curl https://eli-mcp-prod-xyz123.deno.dev/health
```

**7. Ustaw w Supabase:**
```
ELI_MCP_URL = https://eli-mcp-prod-xyz123.deno.dev
```

**Zalety:** ✅ Darmowy, ✅ Globalny CDN, ✅ Zero konfiguracji

---

## 🌐 Opcja 2: Cloudflare Tunnel (dla Raspberry Pi)

Jeśli koniecznie chcesz na Pi:

**1. Zainstaluj cloudflared:**
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared-linux-arm64.deb
```

**2. Zaloguj się:**
```bash
cloudflared tunnel login
```

**3. Stwórz tunel:**
```bash
cloudflared tunnel create eli-mcp
cloudflared tunnel route dns eli-mcp eli.TWOJA-DOMENA.pl
```

**4. Konfiguracja (`~/.cloudflared/config.yml`):**
```yaml
tunnel: eli-mcp
credentials-file: /home/pi/.cloudflared/abc123-....json

ingress:
  - hostname: eli.TWOJA-DOMENA.pl
    service: http://localhost:8080
  - service: http_status:404
```

**5. Uruchom:**
```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

**6. Test:**
```bash
curl https://eli.TWOJA-DOMENA.pl/health
```

**Zalety:** ✅ Zero portów otwartych, ✅ Darmowy na zawsze, ✅ Pi w domu

---

## 🐸 Opcja 3: Mikrus FROG (backup)

Instrukcja wdrożenia ELI MCP Server na darmowym serwerze Mikrus FROG.

## 🐸 Wymagania FROG

- **RAM**: 256MB (wystarczy dla Deno)
- **System**: Alpine Linux (brak możliwości zmiany)
- **Port**: Jeden z 3 dostępnych portów TCP (np. 20123)
- **Domena**: Automatyczna `frog01-20123.wykr.es` z HTTPS

## 📋 Krok 1: Aktywacja serwera FROG

1. Wejdź na https://mikr.us/
2. Wybierz "FROG - Darmowy na zawsze"
3. Wpłać 5 PLN (weryfikacja tożsamości)
4. Po aktywacji otrzymasz:
   - Adres SSH: `frogXX.mikr.us:22`
   - Login: `root`
   - Hasło: (w mailu)
   - 3 porty TCP: np. 20123, 30123, 40123

## 🔧 Krok 2: Logowanie i test ELI API

```bash
# Zaloguj się przez SSH
ssh root@frog01.mikr.us

# Sprawdź przydzielone porty
cat /etc/motd
# Znajdź linię: "Udostępniliśmy Ci trzy porty na adresacji IPv4"
# Np.: 20123, 30123, 40123
```

**WAŻNE: Najpierw test czy ELI API działa!**

```bash
# Zainstaluj curl jeśli nie ma
apk add curl

# Test ELI API
curl -I https://api.sejm.gov.pl/eli/acts

# Jeśli dostaniesz:
# ✅ HTTP/2 200 → API działa! Można kontynuować
# ❌ Access denied → IP zablokowany, szukaj innego VPS
```

## 📦 Krok 3: Instalacja Deno (tylko jeśli test API przeszedł!)

```bash
# Alpine używa sh, nie bash
# Instalacja Deno
curl -fsSL https://deno.land/install.sh | sh

# Dodaj Deno do PATH
echo 'export PATH="$HOME/.deno/bin:$PATH"' >> ~/.profile
source ~/.profile

# Sprawdź instalację
deno --version
```

## 🚀 Krok 4: Deploy MCP Server

```bash
# Sklonuj repo (lub prześlij pliki przez SCP)
apk add git
git clone https://github.com/[twoj-user]/najakiejpodstawie.git
cd najakiejpodstawie/eli-mcp-server

# LUB prześlij pliki przez SCP z lokalnej maszyny:
# scp -r eli-mcp-server root@frog01.mikr.us:/root/

# Utwórz .env z konfiguracją
cat > .env << 'EOF'
PORT=20123
API_KEY=your-super-secret-key-here-change-me
CACHE_TTL=3600
EOF

# ZMIEŃ 20123 na swój przydzielony port!
# ZMIEŃ API_KEY na coś losowego i bezpiecznego!

# Test działania MCP server
deno task test
```

## 🔒 Krok 5: Uruchom jako systemd service

```bash
# Utwórz service file
cat > /etc/init.d/eli-mcp << 'EOF'
#!/sbin/openrc-run

name="ELI MCP Server"
description="MCP Server for Polish Legal Acts API"

directory="/root/najakiejpodstawie/eli-mcp-server"
command="/root/.deno/bin/deno"
command_args="run --allow-net --allow-env src/server.ts"
command_background=true
pidfile="/run/eli-mcp.pid"

depend() {
    need net
}
EOF

# Nadaj uprawnienia
chmod +x /etc/init.d/eli-mcp

# Uruchom i włącz autostart
rc-update add eli-mcp default
rc-service eli-mcp start

# Sprawdź status
rc-service eli-mcp status

# Sprawdź logi
tail -f /var/log/messages | grep eli-mcp
```

## 🌐 Krok 6: Test przez subdomenę wykr.es

```bash
# Twój serwer jest dostępny pod:
# http://frogXX-20123.wykr.es (automatyczny HTTPS!)

# Test z lokalnej maszyny:
curl https://frog01-20123.wykr.es/health

# Powinno zwrócić:
# {"status":"ok","version":"1.0.0","timestamp":"..."}
```

## 🔗 Krok 7: Integracja z Supabase Edge Function

W Supabase dodaj zmienne środowiskowe:

```bash
# W Supabase Dashboard → Project Settings → Edge Functions → Secrets
MCP_SERVER_URL=https://frog01-20123.wykr.es
MCP_API_KEY=your-super-secret-key-here-change-me
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
```

## 🐛 Troubleshooting

### Serwer nie startuje
```bash
# Sprawdź czy port jest zajęty
netstat -tulpn | grep 20123

# Sprawdź logi
tail -100 /var/log/messages
```

### Nie mogę się połączyć z zewnątrz
```bash
# Sprawdź czy serwer nasłuchuje
netstat -tulpn | grep 20123

# Sprawdź czy firewall nie blokuje (FROG nie powinien mieć firewall)
iptables -L
```

### "Access denied" z ELI API
```bash
# Niestety IP Mikrusa jest zablokowany
# Opcje:
# 1. Spróbuj inny VPS (OVH, Hetzner)
# 2. Skontaktuj się z api.sejm.gov.pl o whitelist
# 3. Użyj rozwiązania RAG (scraping + vector DB)
```

## 📊 Monitoring

```bash
# Sprawdź zużycie RAM
free -m

# Sprawdź proces
ps aux | grep deno

# Sprawdź czy działa
curl http://localhost:20123/health
```

## 🔄 Aktualizacja

```bash
cd /root/najakiejpodstawie
git pull
rc-service eli-mcp restart
```

## 💡 Wskazówki

- **RAM**: 256MB wystarczy dla Deno + cache w pamięci
- **Automatyczny restart**: OpenRC zadba o restart po reboot
- **HTTPS**: wykr.es automatycznie obsługuje SSL
- **Backup**: Mikrus robi backup, ale warto mieć kod w git

## 🆘 Pomoc

- Facebook: https://www.facebook.com/groups/mikrus
- Discord: (link w dokumentacji Mikrusa)
- Email: frog@mikr.us (tylko poważne problemy)
