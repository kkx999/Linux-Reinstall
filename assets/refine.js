(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const SOURCE_KEY = 'lr-source-os';
  const SOURCE_LINUX = 'linux';
  const SOURCE_WINDOWS = 'windows';
  const BAT_URLS = {
    overseas: 'https://raw.githubusercontent.com/bin456789/reinstall/main/reinstall.bat',
    china: 'https://cnb.cool/bin456789/reinstall/-/git/raw/main/reinstall.bat'
  };
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
  const CMD_UNSAFE = /["%!?&|<>^\r\n\0]/;
  const SAFE_SPECIALS = '@#$*_-+=';

  let sourceOS = SOURCE_LINUX;
  let renderTimer = null;
  let toastTimer = null;
  let internalPasswordChange = false;

  function saveSourceOS(value) {
    try { localStorage.setItem(SOURCE_KEY, value); } catch (_) {}
  }

  function loadSourceOS() {
    try {
      const value = localStorage.getItem(SOURCE_KEY);
      if (value === SOURCE_WINDOWS || value === SOURCE_LINUX) sourceOS = value;
    } catch (_) {}
  }

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

  function isRandomPasswordMode() {
    return document.querySelector('[data-password-mode="random"]')?.classList.contains('active') ?? true;
  }

  function shellQuote(value) {
    return `'${String(value).replace(/'/g, `'"'"'`)}'`;
  }

  function cmdQuote(value) {
    return `"${String(value).replace(/"/g, '""')}"`;
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

  function cryptoIndex(max) {
    if (max <= 1) return 0;
    const buffer = new Uint32Array(1);
    const limit = 0xffffffff - (0xffffffff % max);
    do { crypto.getRandomValues(buffer); } while (buffer[0] >= limit);
    return buffer[0] % max;
  }

  function makeRandomPasswordCmdSafe() {
    if (sourceOS !== SOURCE_WINDOWS || !isRandomPasswordMode() || internalPasswordChange) return;
    const input = $('passwordInput');
    if (!input || !CMD_UNSAFE.test(input.value)) return;
    internalPasswordChange = true;
    input.value = [...input.value].map(ch => CMD_UNSAFE.test(ch) ? SAFE_SPECIALS[cryptoIndex(SAFE_SPECIALS.length)] : ch).join('');
    internalPasswordChange = false;
  }

  function installSourceSelector() {
    if ($('sourceOsGroup')) return;
    const form = document.querySelector('.config-panel .form-stack');
    if (!form) return;
    const firstField = form.querySelector('.field-group');
    if (!firstField) return;

    const group = document.createElement('div');
    group.className = 'field-group source-os-group';
    group.id = 'sourceOsGroup';
    group.innerHTML = `
      <label>当前 VPS 系统</label>
      <div class="segmented source-os-segmented" role="group" aria-label="当前 VPS 系统">
        <button type="button" class="segment" data-source-os="linux">Linux</button>
        <button type="button" class="segment" data-source-os="windows">Windows</button>
      </div>
      <p class="field-hint source-os-hint" id="sourceOsHint"></p>`;
    form.insertBefore(group, firstField);

    const targetLabel = document.querySelector('label[for="distroButton"]');
    if (targetLabel) targetLabel.textContent = '目标系统';

    group.querySelectorAll('[data-source-os]').forEach(button => {
      button.addEventListener('click', () => {
        sourceOS = button.dataset.sourceOs;
        saveSourceOS(sourceOS);
        makeRandomPasswordCmdSafe();
        renderSourceUI();
        scheduleRender();
      });
    });
  }

  function installStyles() {
    if ($('source-os-style')) return;
    const style = document.createElement('style');
    style.id = 'source-os-style';
    style.textContent = `
      .source-os-group { margin-bottom: 1px; }
      .source-os-segmented { margin-bottom: 0; }
      .source-os-hint { margin-top: 8px; }
      .source-os-hint strong { color: var(--text); font-weight: 680; }
      .source-os-hint .compat-ok { color: var(--green); }
      .source-os-hint .compat-warn { color: var(--yellow); }
      .compat-note { display: inline-flex; align-items: center; gap: 6px; }
      .compat-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: 0 0 6px; }
      @media (max-width: 620px) { .source-os-hint { line-height: 1.65; } }
    `;
    document.head.appendChild(style);
  }

  function renderSourceUI() {
    document.querySelectorAll('[data-source-os]').forEach(button => {
      button.classList.toggle('active', button.dataset.sourceOs === sourceOS);
    });
    const hint = $('sourceOsHint');
    if (hint) {
      hint.innerHTML = sourceOS === SOURCE_LINUX
        ? '<span class="compat-note compat-ok"><span class="compat-dot"></span><span>极简系统兼容：缺少时自动安装 bash / curl / wget / ca-certificates。</span></span>'
        : '<span class="compat-note compat-warn"><span class="compat-dot"></span><span>使用 certutil 下载 reinstall.bat；Windows Defender 实时保护可能阻止下载。</span></span>';
    }

    const terminalTitle = document.querySelector('.terminal-topbar > span');
    if (terminalTitle) terminalTitle.textContent = sourceOS === SOURCE_WINDOWS ? 'generated-command.cmd' : 'generated-command.sh';

    const cancelCode = document.querySelector('.cancel-box code');
    if (cancelCode) cancelCode.textContent = sourceOS === SOURCE_WINDOWS ? 'reinstall.bat reset' : 'bash reinstall.sh reset';
  }

  function buildTargetArgs(maskPassword, windowsSyntax) {
    const id = targetId();
    const version = versionValue();
    const password = maskPassword ? '••••••••••••••••••••' : ($('passwordInput')?.value || '');
    const sshPort = $('sshPort')?.value.trim() || '';
    const quote = windowsSyntax ? cmdQuote : shellQuote;
    const args = [];

    if (WINDOWS_TARGETS.has(id)) {
      const imageName = WINDOWS_IMAGES[version];
      if (!imageName) return null;
      const lang = $('windowsLang')?.value || 'zh-cn';
      const rdp = $('rdpPort')?.value.trim() || '';
      let isoMode = 'auto';
      try { isoMode = localStorage.getItem('lr-win-iso-mode') || 'auto'; } catch (_) {}
      args.push('windows');
      args.push(`--image-name ${quote(imageName)}`);
      args.push(`--lang ${lang}`);
      if (isoMode === 'custom') args.push(`--iso ${quote($('windowsIsoUrl')?.value.trim() || '')}`);
      args.push('--username administrator');
      args.push(`--password ${quote(password)}`);
      args.push(`--rdp-port ${rdp}`);
      args.push(`--ssh-port ${sshPort}`);
      return args;
    }

    if (id === 'redhat') {
      const imageUrl = $('imageUrl')?.value.trim() || '';
      args.push('redhat');
      args.push(`--img ${quote(imageUrl)}`);
    } else {
      args.push(id);
      if (version) args.push(version);
    }
    args.push('--username root');
    args.push(`--password ${quote(password)}`);
    args.push(`--ssh-port ${sshPort}`);
    return args;
  }

  function validateExternal() {
    const password = $('passwordInput')?.value || '';
    const sshPort = $('sshPort')?.value || '';
    if (!password || /[\r\n\0]/.test(password) || !validPort(sshPort)) return { ok: false, message: '' };

    const id = targetId();
    if (id === 'redhat' && !validHttp($('imageUrl')?.value.trim() || '')) return { ok: false, message: '' };
    if (WINDOWS_TARGETS.has(id)) {
      if (!validPort($('rdpPort')?.value || '')) return { ok: false, message: '' };
      let isoMode = 'auto';
      try { isoMode = localStorage.getItem('lr-win-iso-mode') || 'auto'; } catch (_) {}
      if (isoMode === 'custom' && !validIso($('windowsIsoUrl')?.value.trim() || '')) return { ok: false, message: '' };
    }
    if (sourceOS === SOURCE_WINDOWS && CMD_UNSAFE.test(password)) {
      return { ok: false, message: '当前 VPS 为 Windows 时，自定义密码请避免使用 " % ! ? & | < > ^ 等 CMD 特殊字符。' };
    }
    return { ok: true, message: '' };
  }

  function buildLinuxSourceCommand(maskPassword) {
    const args = buildTargetArgs(maskPassword, false);
    if (!args) return '';
    const slash = '\\';
    const url = SH_URLS[region()];
    const lines = [
      '# 极简系统兼容：仅在缺少基础依赖时自动安装',
      'lr_need_deps=0',
      'command -v bash >/dev/null 2>&1 || lr_need_deps=1',
      '(command -v curl >/dev/null 2>&1 || command -v wget >/dev/null 2>&1) || lr_need_deps=1',
      '([ -s /etc/ssl/certs/ca-certificates.crt ] || [ -s /etc/pki/tls/certs/ca-bundle.crt ] || [ -s /etc/ssl/cert.pem ]) || lr_need_deps=1',
      'if [ "$lr_need_deps" -eq 1 ]; then',
      '  if command -v apt-get >/dev/null 2>&1; then',
      '    apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y bash curl wget ca-certificates',
      '  elif command -v apk >/dev/null 2>&1; then',
      '    apk add --no-cache bash curl wget ca-certificates',
      '  elif command -v dnf >/dev/null 2>&1; then',
      '    dnf install -y bash curl wget ca-certificates',
      '  elif command -v yum >/dev/null 2>&1; then',
      '    yum install -y bash curl wget ca-certificates',
      '  elif command -v pacman >/dev/null 2>&1; then',
      '    pacman -Sy --noconfirm bash curl wget ca-certificates',
      '  elif command -v zypper >/dev/null 2>&1; then',
      '    zypper --non-interactive refresh && zypper --non-interactive install bash curl wget ca-certificates',
      '  else',
      '    echo "无法识别包管理器，请先安装 bash、curl/wget 与 ca-certificates。" >&2; exit 1',
      '  fi',
      'fi',
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

  function buildWindowsSourceCommand(maskPassword) {
    const args = buildTargetArgs(maskPassword, true);
    if (!args) return '';
    const url = BAT_URLS[region()];
    const lines = [`certutil -urlcache -f -split ${url} && ^`];
    const target = args.shift();
    if (args.length) {
      lines.push(`reinstall.bat ${target} ^`);
      args.forEach((arg, index) => lines.push(`  ${arg}${index < args.length - 1 ? ' ^' : ''}`));
    } else {
      lines.push(`reinstall.bat ${target}`);
    }
    return lines.join('\n');
  }

  function buildCommand(maskPassword) {
    const validation = validateExternal();
    if (!validation.ok) return '';
    return sourceOS === SOURCE_WINDOWS ? buildWindowsSourceCommand(maskPassword) : buildLinuxSourceCommand(maskPassword);
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

  function syncReadyBadge(valid) {
    const badge = $('readyBadge');
    if (!badge) return;
    badge.classList.toggle('invalid', !valid);
    badge.innerHTML = `<span></span> ${valid ? '命令就绪' : '请检查配置'}`;
  }

  function render() {
    makeRandomPasswordCmdSafe();
    renderSourceUI();
    const validation = validateExternal();
    const preview = buildCommand($('passwordInput')?.type !== 'text');
    if ($('commandPreview')) $('commandPreview').textContent = preview || '请完成有效配置后生成命令。';
    if ($('copyCommand')) $('copyCommand').disabled = !validation.ok;
    if ($('terminalCopy')) $('terminalCopy').disabled = !validation.ok;
    syncReadyBadge(validation.ok);

    const passwordError = $('passwordError');
    if (passwordError && validation.message) passwordError.textContent = validation.message;
  }

  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 0);
  }

  function interceptCopyButtons() {
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

    const reset = $('copyReset');
    if (reset) {
      reset.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        copyText(sourceOS === SOURCE_WINDOWS ? 'reinstall.bat reset' : 'bash reinstall.sh reset', '取消命令已复制');
      }, true);
    }
  }

  function watchForm() {
    ['input', 'change'].forEach(type => document.addEventListener(type, scheduleRender, false));
    document.addEventListener('click', () => setTimeout(() => {
      makeRandomPasswordCmdSafe();
      renderSourceUI();
      render();
    }, 0), false);

    const summary = $('summarySystem');
    if (summary) {
      new MutationObserver(scheduleRender).observe(summary, { childList: true, characterData: true, subtree: true });
    }
  }

  function init() {
    loadSourceOS();
    installStyles();
    installSourceSelector();
    makeRandomPasswordCmdSafe();
    renderSourceUI();
    interceptCopyButtons();
    watchForm();
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
