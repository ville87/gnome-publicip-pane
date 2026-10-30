# GNOME extension to display Public IP in top panel 
Small extension to display public IP in GNOME pane, uses the https://ifconfig.me/ip endpoint to gather the current public IP.    
Tested under GNOME Shell 50.1.

A few things worth pointing out:    

- Soup.Session handles HTTPS requests without invoking external programs.
- timeout: 10 limits how long the request can take.
- GLib.timeout_add_seconds schedules a refresh every 60 seconds.
- Clicking the panel indicator triggers an immediate refresh.
- disable() cleans up the timer, HTTP session and UI element.

The IP response is displayed as text, not interpreted as HTML or executed as code.

## Setup instructions
1. Create the directory
```bash
mkdir -p ~/.local/share/gnome-shell/extensions/public-ip@ifconfig.local
cd ~/.local/share/gnome-shell/extensions/public-ip@ifconfig.local
```   

2. Create metadata.json
```bash
nano metadata.json
```
3. Insert contents from metadata.json file (found in repo)
4. Create extension.js
```bash 
nano extension.js
```
5. Insert contents from extension.js file (found in repo)
6. Enable the extension using:
```bash
gnome-extensions enable public-ip@ifconfig.local
```

## Troubleshooting
If something goes wrong, inspect the GNOME Shell logs:    
```bash
journalctl -f -o cat /usr/bin/gnome-shell
```

You can also inspect extension status:    
```bash
gnome-extensions info public-ip@ifconfig.local
```

To disable it:    
```bash
gnome-extensions disable public-ip@ifconfig.local
```

## Security and network considerations

| Component | Purpose |
|---|---|
| `Soup.Session` | HTTPS communication |
| `ifconfig.me` | Public IP lookup |
| `St.Label` | Display IP in the GNOME panel |
| `GLib.timeout_add_seconds` | Periodic refresh |
| `PanelMenu.Button` | Panel integration |

There are no shell commands, no external dependencies, no downloaded scripts and no elevated privileges.    
The only external communication is an HTTPS GET request to ifconfig.me.    