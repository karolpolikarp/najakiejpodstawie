# Jak zrestartować eli-mcp

Naprawiłem bug w `eli-mcp-server/src/tools.ts`, ale zmiany NIE są aktywne bo usługa nie została zrestartowana.

## Opcja 1: Restart przez systemd (wymaga sudo/root)

```bash
sudo systemctl restart eli-mcp
```

Jeśli dostaniesz błąd sudo (jak wcześniej), spróbuj:

```bash
# Jako root
su -
systemctl restart eli-mcp
systemctl status eli-mcp
```

## Opcja 2: Restart ręcznie

1. Znajdź PID procesu:
```bash
ps aux | grep "deno.*server.ts" | grep -v grep
# lub
lsof -i :8080  # jeśli eli-mcp używa portu 8080
```

2. Zabij proces:
```bash
kill -9 <PID>
```

3. Uruchom ponownie (sprawdź jak jest skonfigurowany w systemd)

## Opcja 3: Restart całego systemu (ostatnia deska ratunku)

```bash
sudo reboot
```

## Po restarcie - sprawdź czy działa:

```bash
sudo journalctl -u eli-mcp -f
```

Potem przetestuj ponownie:
- `art 10 kc` - powinno znaleźć Art. 10 (Pełnoletność)
- `art 103 kc` - powinno znaleźć Art. 103 (Pełnomocnictwo)

W logach powinieneś zobaczyć:
```
[ELI] ✓ Fixed PDF extraction errors in article markers
```

To znaczy że normalizacja zadziałała!
