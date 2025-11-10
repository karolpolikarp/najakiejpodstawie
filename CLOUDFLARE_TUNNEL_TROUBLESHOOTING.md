# Cloudflare Tunnel Troubleshooting Guide

## Problem: Error 1033 - Cloudflare Tunnel Offline

If you're seeing errors like this in your logs:

```
[ELI] API error: 530 <!DOCTYPE html>...Cloudflare Tunnel error...
[ELI] Retrying after 1000ms due to server error...
```

This means your Cloudflare Tunnel is **not running or not accessible**.

## Root Causes

### 1. **Temporary Tunnel URL (Most Common)**

**Problem**: You're using a temporary trycloudflare.com URL like `https://names-ties-driving-incredible.trycloudflare.com`

**Why it fails**: These URLs:
- Change every time you restart cloudflared
- Only work while cloudflared is running
- Are meant for testing, not production

**Solution**: Use a persistent tunnel with a custom domain or named tunnel.

### 2. **Cloudflared Service Not Running**

**Problem**: The cloudflared service on your Raspberry Pi/server has stopped.

**Check**:
```bash
# On your Raspberry Pi
sudo systemctl status cloudflared

# Or if running manually:
ps aux | grep cloudflared
```

**Solution**:
```bash
# Start the service
sudo systemctl start cloudflared

# Enable auto-start on boot
sudo systemctl enable cloudflared

# Check logs
sudo journalctl -u cloudflared -n 50
```

### 3. **Network Connectivity Issues**

**Problem**: Your Raspberry Pi/server lost internet connection.

**Check**:
```bash
# Test internet connectivity
ping -c 4 cloudflare.com

# Test if local server is running
curl http://localhost:8080/health
```

## Quick Fix Steps

### Step 1: Verify Local Server is Running

```bash
cd ~/najakiejpodstawie/eli-mcp-server

# Check if server is running locally
curl http://localhost:8080/health

# If not, start it:
deno task start
```

Expected output:
```json
{"status":"ok","version":"1.0.0",...}
```

### Step 2: Check Cloudflare Tunnel Status

```bash
# List your tunnels
cloudflared tunnel list

# Check if your tunnel is running
sudo systemctl status cloudflared
```

### Step 3: Restart Cloudflare Tunnel

```bash
# If using systemd service:
sudo systemctl restart cloudflared
sudo journalctl -u cloudflared -f

# If running manually:
cloudflared tunnel run eli-mcp
```

### Step 4: Test from External Network

```bash
# From your local machine (NOT the Raspberry Pi):
curl https://your-tunnel-url.trycloudflare.com/health

# Or if using custom domain:
curl https://eli.yourdomain.com/health
```

## Permanent Solutions

### Option 1: Use a Persistent Named Tunnel (Recommended)

1. **Create a named tunnel** (one-time setup):
   ```bash
   cloudflared tunnel create eli-mcp
   # Note the UUID that appears!
   ```

2. **Create config file** `/etc/cloudflared/config.yml`:
   ```yaml
   tunnel: YOUR-TUNNEL-UUID-HERE
   credentials-file: /home/pi/.cloudflared/YOUR-TUNNEL-UUID.json

   ingress:
     - hostname: eli.yourdomain.com  # Use your domain
       service: http://localhost:8080
     - service: http_status:404
   ```

3. **Configure DNS** (if using custom domain):
   ```bash
   cloudflared tunnel route dns eli-mcp eli.yourdomain.com
   ```

4. **Create systemd service** `/etc/systemd/system/cloudflared.service`:
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

5. **Enable and start**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable cloudflared
   sudo systemctl start cloudflared
   ```

6. **Update Supabase environment variable**:
   - Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
   - Update `ELI_MCP_URL` to: `https://eli.yourdomain.com`
   - **Do NOT use** temporary `*.trycloudflare.com` URLs in production!

### Option 2: Use Direct IP/Port (Local Network Only)

If your Supabase Edge Functions run on the same network as your Raspberry Pi:

1. **Find your Raspberry Pi's local IP**:
   ```bash
   hostname -I | awk '{print $1}'
   # Example: 192.168.1.100
   ```

2. **Update Supabase environment variable**:
   ```bash
   ELI_MCP_URL=http://192.168.1.100:8080
   ```

**Note**: This only works if Supabase can reach your local network (usually not possible with cloud-hosted Supabase).

### Option 3: Use a VPS Instead

If Cloudflare Tunnel is unreliable, consider deploying to a VPS:

1. **Deploy to DigitalOcean/Hetzner/etc**
2. **Use a reverse proxy** (nginx/caddy) with SSL
3. **Update ELI_MCP_URL** to your VPS URL

## Monitoring and Alerts

### Add Health Check Monitoring

Create a cron job to monitor tunnel health:

```bash
# Create monitoring script
cat > ~/check-eli-tunnel.sh << 'EOF'
#!/bin/bash
TUNNEL_URL="https://eli.yourdomain.com"
HEALTH_CHECK="${TUNNEL_URL}/health"

if ! curl -f -s -m 10 "$HEALTH_CHECK" > /dev/null; then
  echo "ELI Tunnel DOWN at $(date)" | tee -a ~/tunnel-errors.log
  # Restart services
  sudo systemctl restart eli-mcp
  sudo systemctl restart cloudflared
  sleep 5
  # Send notification (optional)
  # curl -X POST https://your-webhook-url -d "ELI Tunnel is down"
else
  echo "ELI Tunnel OK at $(date)"
fi
EOF

chmod +x ~/check-eli-tunnel.sh

# Add to crontab (check every 5 minutes)
crontab -e
# Add this line:
*/5 * * * * ~/check-eli-tunnel.sh >> ~/tunnel-check.log 2>&1
```

### Check Logs Regularly

```bash
# ELI MCP Server logs
sudo journalctl -u eli-mcp -f

# Cloudflared logs
sudo journalctl -u cloudflared -f

# Combined view
sudo journalctl -u eli-mcp -u cloudflared -f
```

## Testing Your Setup

### 1. Test Local Server
```bash
curl http://localhost:8080/health
curl -X POST http://localhost:8080/tools/get_article \
  -H "Authorization: Bearer dev-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"actCode":"kc","articleNumber":"533"}'
```

### 2. Test Through Tunnel
```bash
curl https://eli.yourdomain.com/health
curl -X POST https://eli.yourdomain.com/tools/get_article \
  -H "Authorization: Bearer dev-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"actCode":"kc","articleNumber":"533"}'
```

### 3. Test End-to-End
```bash
# From your application logs, you should see:
[ELI] Checking health of ELI MCP server: https://eli.yourdomain.com
[ELI] Health check passed
[ELI] Fetching article (attempt 1/3): kc 533
[ELI] Successfully fetched and validated article kc 533
```

## Error Messages Explained

### "Cloudflare Tunnel offline"
```
Serwer ELI MCP jest tymczasowo niedostępny (Cloudflare Tunnel offline).
Sprawdź czy cloudflared jest uruchomiony lub użyj bezpośredniego URL.
```

**Cause**: The cloudflared service is not running or can't reach Cloudflare's edge.

**Fix**: Restart cloudflared service (see Step 3 above).

### "Connection timeout"
```
Request timeout after 10000ms
```

**Cause**: Network is too slow or server is overloaded.

**Fix**:
- Check network connectivity
- Increase timeout in `eli-tools.ts` (MCP_TIMEOUT_MS)
- Check Raspberry Pi CPU/memory usage

### "Server returned 530"
```
[ELI] API error: 530 <!DOCTYPE html>...
```

**Cause**: Cloudflare can't reach your origin server (Error 1033).

**Fix**: See "Root Causes" section above.

## Best Practices

✅ **DO**:
- Use named tunnels with custom domains
- Set up systemd services for auto-restart
- Monitor tunnel health with cron jobs
- Keep cloudflared updated
- Use strong API keys in production

❌ **DON'T**:
- Use temporary `*.trycloudflare.com` URLs in production
- Hardcode tunnel URLs in source code (use environment variables)
- Ignore cloudflared logs
- Run cloudflared manually (use systemd)
- Expose ELI MCP without authentication

## Getting Help

If you're still having issues:

1. **Check all logs**:
   ```bash
   sudo journalctl -u eli-mcp -n 100
   sudo journalctl -u cloudflared -n 100
   ```

2. **Verify configuration**:
   ```bash
   cat /etc/cloudflared/config.yml
   cloudflared tunnel list
   ```

3. **Test each component separately**:
   - Local ELI MCP server (port 8080)
   - Cloudflared tunnel
   - DNS resolution
   - End-to-end from Supabase

4. **Create an issue** with:
   - Full error logs
   - Your config.yml (redact sensitive info)
   - Output of `cloudflared tunnel list`
   - Network setup (local/VPS/cloud)

## Related Documentation

- [DEPLOYMENT-RPI.md](./eli-mcp-server/DEPLOYMENT-RPI.md) - Full Raspberry Pi deployment guide
- [ELI_MCP_INTEGRATION.md](./ELI_MCP_INTEGRATION.md) - Integration guide
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
