# gorani.me

## React Native Web Auto Deploy (Windows local server)

This repository includes automation for deploying `react-native` web build to a Windows local server when `main` is updated.

### Added files
- `.github/workflows/deploy-react-native-web.yml`
- `scripts/deploy-react-native-web.ps1`
- `deploy/nginx/gorani.me.conf`

### Server assumptions
- Nginx path: `C:\Users\ksj\nginx-1.29.2`
- Web root: `C:\Users\ksj\nginx-1.29.2\html\gorani.me`
- Domain: `gorani.me`
- Local IP: `192.168.1.234`

`react-native` source is built from GitHub Actions checkout workspace (`GITHUB_WORKSPACE`), not from a fixed local project folder.

### One-time setup
1. Install GitHub Actions self-hosted runner on your Windows server (`C:\Users\ksj\gorani.me` machine).
2. Register runner with labels including `self-hosted` and `windows`.
3. Put nginx server config (`deploy/nginx/gorani.me.conf`) into your nginx `conf` include path.
4. Start nginx and verify: `nginx -t`.

### Deploy trigger
- Trigger: push to `main` with changes under `react-native/**`.
- Action: build web static output and sync to nginx web root, then run `nginx -s reload`.
