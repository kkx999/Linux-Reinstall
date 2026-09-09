(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const SH_URLS = {
    overseas: 'https://raw.githubusercontent.com/bin456789/reinstall/main/reinstall.sh',
    china: 'https://cnb.cool/bin456789/reinstall/-/git/raw/main/reinstall.sh'
  };
  const WINDOWS_IMAGES = {
    'win11-ltsc-2024': 'Windows 11 Enterprise LTSC 2024',
    'win11-pro': 'Windows 11 Pro',
    'win11-enterprise': 'Windows 11 Enterprise',
    'win11-home': 'Windows 11 Home',
    'win10-ltsc-2021': 'Windows 10 Enterprise LTSC 2021',
    'win10-pro': 'Windows 10 Pro',
    'win10-enterprise': 'Windows 10 Enterprise',
    'win81-pro': 'Windows 8.1 Pro',
    'win7-pro': 'Windows 7 Professional',
    'ws2025-standard': 'Windows Server 2025 ServerStandard',
    'ws2025-datacenter': 'Windows Server 2025 ServerDatacenter',
    'ws2022-standard': 'Windows Server 2022 ServerStandard',
    'ws2022-datacenter': 'Windows Server 2022 ServerDatacenter',
    'ws2019-standard': 'Windows Server 2019 ServerStandard',
    'ws2019-datacenter': 'Windows Server 2019 ServerDatacenter',
    'ws2016-standard': 'Windows Server 2016 ServerStandard',
    'ws2016-datacenter': 'Windows Server 2016 ServerDatacenter',
    'ws2012r2-standard': 'Windows Server 2012 R2 ServerStandard',
    'ws2008r2-standard': 'Windows Server 2008 R2 ServerStandard'
  };
  const WINDOWS_TARGETS = new Set(['windows', 'windows-server']);

  let renderTimer = null;
  let toastTimer = null;

  function targetId() {
    try { return localStorage.getItem('lr-distro') || 'debian'; }
    catch (_) { return 'debian'; }
  }

  function region() {
    try { return localStorage.getItem('lr-region') === 'china' ? 'china' : 'overseas'; }
    catch (_) { return 'overseas'; }
  }

  function versionValue() {
    return $('versionSelect')?.value ?? '';
  }

  function shellQuote(value) {
    return `'${String(value).replace(/'/g, `'"'"'`)}'`;
  }

  function validPort(value) {
    return /^\d+$/.test(String(value).trim()) && Number(value) >= 1 && Number(value) <= 65535;
  }

  function validHttp(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) { return false; }
  }

  function validIso(value) {
    return validHttp(value) || /^magnet:\?xt=/i.test(value);
  }

  function buildTargetArgs(maskPassword) {
    const id = targetId();
    const version = versionValue();
    const password = maskPassword ? '••••••••••••••••••••' : ($('passwordInput')?.value || '');
    const sshPort = $('sshPort')?.value.trim() || '';
    const args = [];

    if (WINDOWS_TARGETS.has(id)) {
      const imageName = WINDOWS_IMAGES[version];
      if (!imageName) return null;
      const lang = $('windowsLang')?.value || 'zh-cn';
      const rdp = $('rdpPort')?.value.trim() || '';
      let isoMode = 'auto';
      try { isoMode = localStorage.getItem('lr-win-iso-mode') || 'auto'; } catch (_) {}

      args.push('windows');
      args.push(`--image-name ${shellQuote(imageName)}`);
      args.push(`--lang ${lang}`);
      if (isoMode === 'custom') args.push(`--iso ${shellQuote($('windowsIsoUrl')?.value.trim() || '')}`);
      args.push('--username administrator');
      args.push(`--password ${shellQuote(password)}`);
      args.push(`--rdp-port ${rdp}`);
      args.push(`--ssh-port ${sshPort}`);
      return args;
    }

    if (id === 'redhat') {
      args.push('redhat');
      args.push(`--img=${shellQuote($('imageUrl')?.value.trim() || '')}`);
    } else {
      args.push(id);
      if (version) args.push(version);
    }

    args.push('--username root');
    args.push(`--password ${shellQuote(password)}`);
    args.push(`--ssh-port ${sshPort}`);
    return args;
  }

  function validate() {
    const password = $('passwordInput')?.value || '';
    const sshPort = $('sshPort')?.value || '';
    if (!password || /[\r\n\0]/.test(password) || password.length > 128 || !validPort(sshPort)) return false;

    const id = targetId();
    if (id === 'redhat' && !validHttp($('imageUrl')?.value.trim() || '')) return false;

    if (WINDOWS_TARGETS.has(id)) {
      if (!validPort($('rdpPort')?.value || '')) return false;
      let isoMode = 'auto';
      try { isoMode = localStorage.getItem('lr-win-iso-mode') || 'auto'; } catch (_) {}
      if (isoMode === 'custom' && !validIso($('windowsIsoUrl')?.value.trim() || '')) return false;
    }
    return true;
  }

  function bootstrapLines() {
    return [
      'if command -v apt-get >/dev/null 2>&1; then',
      '  apt-get update && apt-get install -y curl wget ca-certificates',
      'elif command -v dnf >/dev/null 2>&1; then',
      '  dnf install -y curl wget ca-certificates',
      'elif command -v yum >/dev/null 2>&1; then',
      '  yum install -y curl wget ca-certificates',
      'elif command -v apk >/dev/null 2>&1; then',
      '  apk add --no-cache curl wget ca-certificates',
      'elif command -v pacman >/dev/null 2>&1; then',
      '  pacman -Sy --noconfirm curl wget ca-certificates',
      'elif command -v zypper >/dev/null 2>&1; then',
      '  zypper --non-interactive install curl wget ca-certificates',
      'else',
      '  echo "无法识别当前 VPS 的包管理器，请先安装 curl 或 wget。" >&2; exit 1',
      'fi'
    ];
  }

  function buildCommand(maskPassword) {
    if (!validate()) return '';
    const args = buildTargetArgs(maskPassword);
    if (!args) return '';

    const slash = '\\';
    const url = SH_URLS[region()];
    const lines = [
      ...bootstrapLines(),
      '',
      `(curl -fL -o reinstall.sh ${url} || wget -O reinstall.sh ${url}) && ${slash}`
    ];

    const target = args.shift();
    if (args.length) {
      lines.push(`  bash reinstall.sh ${target} ${slash}`);
      args.forEach((arg, index) => lines.push(`    ${arg}${index < args.length - 1 ? ` ${slash}` : ''}`));
    } else {
      lines.push(`  bash reinstall.sh ${target}`);
    }
    return lines.join('\n');
  }

  function showToast(message) {
    const toast = $('toast');
    const text = $('toastText');
    if (!toast || !text) return;
    clearTimeout(toastTimer);
    text.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  async function copyText(text, message) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const area = document.createElement('textarea');
        area.value = text;
        area.readOnly = true;
        area.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
      }
      showToast(message);
    } catch (_) { showToast('复制失败，请手动复制'); }
  }

  function render() {
    const ok = validate();
    const preview = buildCommand($('passwordInput')?.type !== 'text');
    if ($('commandPreview')) $('commandPreview').textContent = preview || '请完成有效配置后生成命令。';
    if ($('copyCommand')) $('copyCommand').disabled = !ok;
    if ($('terminalCopy')) $('terminalCopy').disabled = !ok;

    const badge = $('readyBadge');
    if (badge) {
      badge.classList.toggle('invalid', !ok);
      badge.innerHTML = `<span></span> ${ok ? '命令就绪' : '请检查配置'}`;
    }
  }

  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 0);
  }

  function interceptCopies() {
    ['copyCommand', 'terminalCopy'].forEach(id => {
      const button = $(id);
      if (!button) return;
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        const command = buildCommand(false);
        if (command) copyText(command, '完整重装命令已复制');
      }, true);
    });
  }

  function watchForm() {
    ['input', 'change'].forEach(type => document.addEventListener(type, scheduleRender, false));
    document.addEventListener('click', () => setTimeout(render, 0), false);
    const summary = $('summarySystem');
    if (summary) new MutationObserver(scheduleRender).observe(summary, { childList: true, subtree: true, characterData: true });
  }

  function cleanupOldUI() {
    $('sourceOsGroup')?.remove();
    $('source-os-style')?.remove();
    const targetLabel = document.querySelector('label[for="distroButton"]');
    if (targetLabel) targetLabel.textContent = '系统';
    const terminalTitle = document.querySelector('.terminal-topbar > span');
    if (terminalTitle) terminalTitle.textContent = 'generated-command.sh';
    const cancelCode = document.querySelector('.cancel-box code');
    if (cancelCode) cancelCode.textContent = 'bash reinstall.sh reset';
  }

  function init() {
    cleanupOldUI();
    interceptCopies();
    watchForm();
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();