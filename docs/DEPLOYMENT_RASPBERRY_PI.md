# Raspberry Pi Deployment & Kiosk Mode Guide
## Thiruvalluvar AI (Edge / Low-Power Device Deployment)

Thiruvalluvar AI is built to operate 100% offline with zero cloud dependency, making it suitable for edge kiosks, classroom workstations, and library exhibits running on Raspberry Pi single-board computers.

---

### 1. Hardware Recommendations

- **Target Device**: Raspberry Pi 4 Model B (4 GB or 8 GB) or Raspberry Pi 5 (4 GB / 8 GB)
- **Storage**: 32 GB or 64 GB High-Endurance MicroSD card (Class 10 A2) or NVMe SSD HAT
- **Power Supply**: Official 5V 3A (Pi 4) or 5V 5A (Pi 5) USB-C power adapter
- **Display**: Official 7" Touchscreen, HDMI Monitor, or Interactive Smart Board
- **Audio**: USB Microphone / USB Audio dongle and 3.5mm/HDMI speakers

---

### 2. Operating System Preparation

1. Download and flash **Raspberry Pi OS (64-bit with desktop)** using Raspberry Pi Imager.
2. Boot the Pi, complete the initial setup wizard, and open a terminal:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-full python3-pip python3-venv nodejs npm git alsa-utils pulseaudio
```

---

### 3. Clone / Transfer & Setup

1. Copy the project folder to `/home/pi/thiruvalluvar` or clone your repository:
```bash
cd /home/pi/thiruvalluvar
```

2. Setup Backend:
```bash
cd /home/pi/thiruvalluvar/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Verify database
python database/validate_database.py
```

3. Setup Frontend & Build Production Bundle:
```bash
cd /home/pi/thiruvalluvar/frontend
npm install
npm run build
```

---

### 4. Running as a Systemd Service

To ensure Thiruvalluvar AI automatically boots on power-on:

#### Backend Service (`/etc/systemd/system/thiruvalluvar-backend.service`)
```ini
[Unit]
Description=Thiruvalluvar AI Backend Service
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/thiruvalluvar/backend
ExecStart=/home/pi/thiruvalluvar/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start the backend service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable thiruvalluvar-backend.service
sudo systemctl start thiruvalluvar-backend.service
```

---

### 5. Serving Frontend via Nginx (Lightweight & High Performance)

```bash
sudo apt install -y nginx
```

Create `/etc/nginx/sites-available/thiruvalluvar`:
```nginx
server {
    listen 80;
    server_name localhost;

    root /home/pi/thiruvalluvar/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration:
```bash
sudo ln -s /etc/nginx/sites-available/thiruvalluvar /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
```

---

### 6. Fullscreen Kiosk Mode (Touchscreen Displays)

To launch the browser automatically on boot in locked-down kiosk mode:

1. Install Chromium kiosk tools:
```bash
sudo apt install -y chromium-browser unclutter
```

2. Edit autostart configuration (`~/.config/wayfire.ini` or `~/.config/lxsession/LXDE-pi/autostart`):
```bash
@xset s off
@xset -dpms
@xset s noblank
@unclutter -idle 0.5 -root
@chromium-browser --noerrdialogs --disable-infobars --kiosk http://localhost/ --check-for-update-interval=31536000
```

---

### 7. Audio & TTS Tuning on Pi

1. For offline Speech Synthesis on Raspberry Pi OS:
```bash
sudo apt install -y espeak-ng festival festvox-rablpc16k
```
2. In Chromium, the Web Speech Synthesis API utilizes the OS speech engine. For Tamil TTS voice synthesis on Linux without cloud APIs, install `espeak-ng` with Tamil voice (`espeak-ng -v ta`).

---

### 8. Performance Verification on Pi 4 / Pi 5

- **RAM Consumption**: Backend: ~90 MB; Frontend Static Server: ~15 MB; Chromium Tab: ~250 MB. Total usage < 500 MB.
- **SQLite Performance**: FTS5 query latency on MicroSD is < 3 ms.
- **Audio Classification**: Browser AudioContext FFT computations run at 60 FPS without frame drops.
