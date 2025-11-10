# Debug Status - Art 10/103 KC Problem

## Problem
Po restarcie eli-mcp, artykuły 10 i 103 KC nadal nie działają.

## Co widzimy w logach:
```
Nov 10 11:20:52 raspberrypi deno[19275]: [ELI] Context 1: ...A rt. 103...
```

**❌ Nadal jest błąd** - "A rt." zamiast "Art." (ze spacją)

## Co powinniśmy widzieć:
```
[ELI] ✓ Fixed PDF extraction errors in article markers
```

Ten log NIE pojawia się - **poprawka nie została załadowana!**

## Weryfikacja:
1. ✅ Poprawka jest w pliku: `grep "Fixed PDF extraction" eli-mcp-server/src/tools.ts` → linia 605
2. ✅ Jest tylko jedna kopia eli-mcp-server: `/home/user/najakiejpodstawie/eli-mcp-server/`
3. ✅ Restart nastąpił: PID zmienił się z 19234 na 19275
4. ✅ Deno cache wyczyszczony: `rm -rf ~/.cache/deno`
5. ❌ Poprawka nie działa po restarcie

## Możliwe przyczyny:

### 1. Deno cache problem
Deno może cachować skompilowany kod. Spróbuj:
```bash
# Jako user który uruchamia eli-mcp
rm -rf ~/.cache/deno
# Potem restart
sudo systemctl restart eli-mcp
```

### 2. Systemd uruchamia jako inny user
Sprawdź jako kto działa eli-mcp:
```bash
ps aux | grep deno | grep server
```

Jeśli działa jako `pi` lub inny user, wyczyść jego cache:
```bash
sudo rm -rf /home/pi/.cache/deno  # zamień pi na właściwego usera
```

### 3. Systemd używa WorkingDirectory w innym miejscu
Sprawdź service file i upewnij się że WorkingDirectory to:
```
WorkingDirectory=/home/user/najakiejpodstawie/eli-mcp-server
```

### 4. Trzeba zrobić "hard restart"
Zamiast `restart` spróbuj:
```bash
sudo systemctl stop eli-mcp
sleep 2
sudo systemctl start eli-mcp
sudo journalctl -u eli-mcp -f
```

W logach **MUSISZ** zobaczyć:
```
[ELI] ✓ Fixed PDF extraction errors in article markers
```

Jak tylko zobaczysz ten log, test "art 10 kc" będzie działać!

## Najszybsze rozwiązanie:
Możesz też spróbować reboot całego systemu:
```bash
sudo reboot
```

Po reboot eli-mcp załaduje kod od nowa.
