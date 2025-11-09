# Deployment Guide - Raspberry Pi + Cloudflare Tunnel

Instrukcja wdrożenia ELI MCP Server na Raspberry Pi 5 z dostępem przez Cloudflare Tunnel (darmowy HTTPS).

## 🍓 Wymagania

- **Raspberry Pi 5** (4GB/8GB RAM)
- **Raspberry Pi OS 64-bit** (Bookworm lub nowszy)
- **Stałe połączenie internetowe**
- **Konto Cloudflare** (darmowe)

## 🧪 Krok 0: TEST czy API działa z Twojego IP (KRYTYCZNE!)

**NAJPIERW sprawdź czy sejm.gov.pl nie blokuje Twojego domowego IP!**

```bash
# Na Raspberry Pi uruchom:
wget https://raw.githubusercontent.com/[twoj-repo]/eli-mcp-server/main/test-from-home.sh
bash test-from-home.sh

# LUB prosty test:
curl -I https://api.sejm.gov.pl/eli/acts
```

**Jeśli dostaniesz:**
- ✅ `HTTP/2 200` → **ŚWIETNIE! Kontynuuj deployment**
- ❌ `Access denied` → Twój ISP jest zablokowany, użyj VPS

---

## 📦 Krok 1: Przygotowanie Raspberry Pi

```bash
# Update systemu
sudo apt update && sudo apt upgrade -y

# Zainstaluj potrzebne narzędzia
sudo apt install -y git curl wget

# Zainstaluj Deno
curl -fsSL https://deno.land/install.sh | sh

# Dodaj Deno do PATH
echo 'export DENO_INSTALL="/home/pi/.deno"' >> ~/.bashrc
echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Sprawdź instalację
deno --version
```

## 🚀 Krok 2: Sklonuj i skonfiguruj MCP Server

```bash
# Sklonuj repozytorium
cd ~
git clone https://github.com/[twoj-user]/najakiejpodstawie.git
cd najakiejpodstawie/eli-mcp-server

# Utwórz plik .env
cat > .env << 'EOF'
PORT=8080
API_KEY=$(openssl rand -base64 32)
CACHE_TTL=3600
EOF

# ZAPISZ API_KEY - będzie potrzebny później!
echo "Twój API_KEY:"
grep API_KEY .env
```

## 🧪 Krok 3: Test lokalny

```bash
# Uruchom serwer
deno task start

# W nowym terminalu (lub przez SSH):
curl http://localhost:8080/health

# Powinno zwrócić:
# {"status":"ok","version":"1.0.0",...}

# Test konkretnego endpointa:
curl -X POST http://localhost:8080/tools/get_article \
  -H "Authorization: Bearer [TWOJ_API_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"articleNumber":"533","actCode":"kc"}'

# Jeśli działa - przejdź dalej!
# Zatrzymaj serwer: Ctrl+C
```

## 🌐 Krok 4: Cloudflare Tunnel (darmowy HTTPS!)

### 4.1. Utwórz konto i zainstaluj cloudflared

```bash
# Pobierz cloudflared dla ARM64
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64
sudo mv cloudflared-linux-arm64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared

# Sprawdź wersję
cloudflared --version
```

### 4.2. Zaloguj się do Cloudflare

```bash
# Uruchom autoryzację
cloudflared tunnel login

# Otworzy się przeglądarka - zaloguj się do Cloudflare
# Wybierz domenę (jeśli masz) LUB użyj darmowej subdomeny
```

### 4.3. Utwórz tunnel

```bash
# Utwórz tunnel o nazwie "eli-mcp"
cloudflared tunnel create eli-mcp

# Zapisz UUID tunelu - będzie wyświetlony!
# Np: Created tunnel eli-mcp with id a1b2c3d4-e5f6-7890-abcd-ef1234567890

# Utwórz config file
sudo mkdir -p /etc/cloudflared
sudo nano /etc/cloudflared/config.yml
```

**Zawartość `config.yml`:**

```yaml
tunnel: a1b2c3d4-e5f6-7890-abcd-ef1234567890  # TWÓJ UUID!
credentials-file: /home/pi/.cloudflared/a1b2c3d4-e5f6-7890-abcd-ef1234567890.json

ingress:
  # Jeśli masz własną domenę:
  - hostname: eli.twojadomena.pl
    service: http://localhost:8080

  # LUB użyj darmowej subdomeny Cloudflare:
  # - hostname: eli-mcp-twoja-nazwa.trycloudflare.com
  #   service: http://localhost:8080

  # Catch-all (wymagane)
  - service: http_status:404
```

### 4.4. Dodaj DNS record (jeśli masz domenę)

```bash
# Jeśli używasz własnej domeny:
cloudflared tunnel route dns eli-mcp eli.twojadomena.pl

# Cloudflare automatycznie doda CNAME record
```

### 4.5. Test tunnel

```bash
# Uruchom tunnel w trybie testowym
cloudflared tunnel run eli-mcp

# W innym terminalu uruchom MCP server:
cd ~/najakiejpodstawie/eli-mcp-server
deno task start

# Test z zewnątrz (z telefonu/innego kompa):
curl https://eli.twojadomena.pl/health
```

## 🔄 Krok 5: Automatyczny start (systemd)

### 5.1. Service dla MCP Server

```bash
sudo nano /etc/systemd/system/eli-mcp.service
```

**Zawartość:**

```ini
[Unit]
Description=ELI MCP Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/najakiejpodstawie/eli-mcp-server
ExecStart=/home/pi/.deno/bin/deno run --allow-net --allow-env src/server.ts
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 5.2. Service dla Cloudflare Tunnel

```bash
sudo nano /etc/systemd/system/cloudflared.service
```

**Zawartość:**

```ini
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=pi
ExecStart=/usr/local/bin/cloudflared tunnel --config /etc/cloudflared/config.yml run
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 5.3. Włącz i uruchom services

```bash
# Przeładuj systemd
sudo systemctl daemon-reload

# Włącz autostart
sudo systemctl enable eli-mcp.service
sudo systemctl enable cloudflared.service

# Uruchom services
sudo systemctl start eli-mcp.service
sudo systemctl start cloudflared.service

# Sprawdź status
sudo systemctl status eli-mcp.service
sudo systemctl status cloudflared.service

# Sprawdź logi
sudo journalctl -u eli-mcp.service -f
sudo journalctl -u cloudflared.service -f
```

## 🧪 Krok 6: Test końcowy

```bash
# Test z lokalnej maszyny/telefonu:
curl https://eli.twojadomena.pl/health

# Test konkretnego endpointa:
curl -X POST https://eli.twojadomena.pl/tools/get_article \
  -H "Authorization: Bearer [TWOJ_API_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"articleNumber":"533","actCode":"kc"}'

# Jeśli działa - GRATULACJE! 🎉
```

## 🔗 Krok 7: Integracja z Supabase

W Supabase Dashboard dodaj zmienne środowiskowe:

```
MCP_SERVER_URL=https://eli.twojadomena.pl
MCP_API_KEY=[TWOJ_API_KEY]
```

## 📊 Monitoring i konserwacja

```bash
# Sprawdź status services
sudo systemctl status eli-mcp cloudflared

# Sprawdź logi
sudo journalctl -u eli-mcp -n 50
sudo journalctl -u cloudflared -n 50

# Restart po zmianach
sudo systemctl restart eli-mcp
sudo systemctl restart cloudflared

# Zużycie zasobów
htop

# Sprawdź czy wszystko działa
curl http://localhost:8080/health
curl https://eli.twojadomena.pl/health
```

## 🔄 Aktualizacja

```bash
cd ~/najakiejpodstawie
git pull
sudo systemctl restart eli-mcp
```

## ⚡ Zalety tego setup:

- ✅ **Darmowy** (tylko prąd ~3-5 PLN/m)
- ✅ **Automatyczny HTTPS** (Cloudflare)
- ✅ **Nie trzeba otwierać portów** na routerze
- ✅ **DDoS protection** (Cloudflare)
- ✅ **Szybki** (lokalne IP do sejm.gov.pl)
- ✅ **Pełna kontrola**
- ✅ **8GB RAM** (więcej niż wystarczy)

## 🐛 Troubleshooting

### Serwer nie startuje
```bash
# Sprawdź logi
sudo journalctl -u eli-mcp -n 100

# Sprawdź czy port jest wolny
sudo netstat -tulpn | grep 8080

# Sprawdź uprawnienia
ls -la /home/pi/najakiejpodstawie/eli-mcp-server
```

### Cloudflare Tunnel nie działa
```bash
# Sprawdź logi
sudo journalctl -u cloudflared -n 100

# Sprawdź czy tunnel istnieje
cloudflared tunnel list

# Sprawdź config
cat /etc/cloudflared/config.yml
```

### "Access denied" z sejm.gov.pl
```bash
# Sprawdź z czyjego IP wychodzi request
curl https://api.ipify.org

# Test bezpośredni
curl -I https://api.sejm.gov.pl/eli/acts

# Jeśli nie działa - Twój ISP jest zablokowany
# Użyj VPN z polskim IP lub VPS
```

## 💡 Opcja bez własnej domeny

Jeśli nie masz domeny, Cloudflare oferuje **darmową subdomenę**:

```bash
# Zamiast konfigurować DNS, po prostu uruchom:
cloudflared tunnel --url http://localhost:8080

# Dostaniesz losowy URL typu:
# https://eli-mcp-random-name.trycloudflare.com

# Ale uwaga: URL zmienia się po każdym restarcie!
# Lepiej wykupić domenę (~20 PLN/rok)
```

## 🎯 Podsumowanie kosztów

| Pozycja | Koszt |
|---------|-------|
| Raspberry Pi 5 8GB | ~500 PLN (jednorazowo) |
| Zasilacz + karta SD | ~100 PLN (jednorazowo) |
| Prąd (~5W 24/7) | ~3-5 PLN/m |
| Cloudflare Tunnel | **0 PLN** |
| Domena (opcjonalnie) | ~20 PLN/rok |
| **RAZEM (rok)** | **~40-80 PLN** |

vs VPS: ~200-300 PLN/rok
