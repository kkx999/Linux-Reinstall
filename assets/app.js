(() => {
  'use strict';

  const SYSTEMS = [
    { id: 'debian', name: 'Debian', avatar: 'D', meta: '稳定、轻量、常用', versions: [
      { value: '13', label: '13', tag: '推荐' }, { value: '12', label: '12', tag: '稳定' }, { value: '11', label: '11', tag: 'ELTS' }, { value: '10', label: '10', tag: 'ELTS' }, { value: '9', label: '9', tag: 'ELTS' }
    ]},
    { id: 'ubuntu', name: 'Ubuntu', avatar: 'U', meta: '主流云服务器发行版', versions: [
      { value: '26.04', label: '26.04 LTS', tag: '新 LTS' }, { value: '24.04', label: '24.04 LTS', tag: '推荐' }, { value: '22.04', label: '22.04 LTS', tag: '稳定' }, { value: '20.04', label: '20.04 LTS' }, { value: '18.04', label: '18.04 LTS', tag: '旧版' }
    ]},
    { id: 'windows', name: 'Windows', avatar: 'W', meta: '桌面版 · 官方原版 ISO', windows: true, versions: [
      { value: 'win11-ltsc-2024', label: 'Windows 11 Enterprise LTSC 2024', imageName: 'Windows 11 Enterprise LTSC 2024', ram: '1 GB', disk: '25 GB', tag: '推荐', note: '上游会自动绕过 Windows 11 硬件限制，并按需注入云厂商驱动。' },
      { value: 'win11-pro', label: 'Windows 11 Pro', imageName: 'Windows 11 Pro', ram: '1 GB', disk: '25 GB' },
      { value: 'win11-enterprise', label: 'Windows 11 Enterprise', imageName: 'Windows 11 Enterprise', ram: '1 GB', disk: '25 GB' },
      { value: 'win10-ltsc-2021', label: 'Windows 10 Enterprise LTSC 2021', imageName: 'Windows 10 Enterprise LTSC 2021', ram: '1 GB', disk: '25 GB', tag: 'LTSC' },
      { value: 'win10-pro', label: 'Windows 10 Pro', imageName: 'Windows 10 Pro', ram: '1 GB', disk: '25 GB' },
      { value: 'win10-enterprise', label: 'Windows 10 Enterprise', imageName: 'Windows 10 Enterprise', ram: '1 GB', disk: '25 GB' },
      { value: 'win81-pro', label: 'Windows 8.1 Pro', imageName: 'Windows 8.1 Pro', ram: '512 MB', disk: '25 GB', tag: '旧版', note: '旧版 Windows 可能存在驱动兼容性限制，安装前建议确认平台支持。' },
      { value: 'win7-pro', label: 'Windows 7 Professional', imageName: 'Windows 7 Professional', ram: '512 MB', disk: '25 GB', tag: '旧版', note: 'Windows 7 在部分 EFI / 新硬件平台可能缺少驱动；Hyper-V / Azure 需使用第 1 代虚拟机。' }
    ]},
    { id: 'windows-server', name: 'Windows Server', avatar: 'WS', meta: '服务器版 · 官方原版 ISO', windows: true, versions: [
      { value: 'ws2025-standard', label: 'Windows Server 2025 Standard', imageName: 'Windows Server 2025 ServerStandard', ram: '1 GB', disk: '25 GB', tag: '推荐' },
      { value: 'ws2025-datacenter', label: 'Windows Server 2025 Datacenter', imageName: 'Windows Server 2025 ServerDatacenter', ram: '1 GB', disk: '25 GB' },
      { value: 'ws2022-standard', label: 'Windows Server 2022 Standard', imageName: 'Windows Server 2022 ServerStandard', ram: '1 GB', disk: '25 GB', tag: '稳定' },
      { value: 'ws2022-datacenter', label: 'Windows Server 2022 Datacenter', imageName: 'Windows Server 2022 ServerDatacenter', ram: '1 GB', disk: '25 GB' },
      { value: 'ws2019-standard', label: 'Windows Server 2019 Standard', imageName: 'Windows Server 2019 ServerStandard', ram: '1 GB', disk: '25 GB' },
      { value: 'ws2019-datacenter', label: 'Windows Server 2019 Datacenter', imageName: 'Windows Server 2019 ServerDatacenter', ram: '1 GB', disk: '25 GB' },
      { value: 'ws2016-standard', label: 'Windows Server 2016 Standard', imageName: 'Windows Server 2016 ServerStandard', ram: '1 GB', disk: '25 GB' },
      { value: 'ws2016-datacenter', label: 'Windows Server 2016 Datacenter', imageName: 'Windows Server 2016 ServerDatacenter', ram: '1 GB', disk: '25 GB' },
      { value: 'ws2012r2-standard', label: 'Windows Server 2012 R2 Standard', imageName: 'Windows Server 2012 R2 ServerStandard', ram: '512 MB', disk: '25 GB', tag: '旧版', note: '旧版 Windows Server 可能存在驱动兼容性限制，建议优先使用 2019 或更新版本。' },
      { value: 'ws2008r2-standard', label: 'Windows Server 2008 R2 Standard', imageName: 'Windows Server 2008 R2 ServerStandard', ram: '512 MB', disk: '25 GB', tag: '旧版', note: 'Server 2008 R2 在 EFI / 新硬件平台可能缺少驱动；Hyper-V / Azure 需使用第 1 代虚拟机。' }
    ]},
    { id: 'alpine', name: 'Alpine Linux', avatar: 'A', meta: '极简、低资源占用', versions: [
      { value: '3.24', label: '3.24', tag: '推荐' }, { value: '3.23', label: '3.23' }, { value: '3.22', label: '3.22' }, { value: '3.21', label: '3.21' }
    ]},
    { id: 'rocky', name: 'Rocky Linux', avatar: 'R', meta: 'RHEL 兼容发行版', versions: ['10','9','8'].map(v => ({ value: v, label: v })) },
    { id: 'almalinux', name: 'AlmaLinux', avatar: 'AL', meta: 'RHEL 兼容发行版', versions: ['10','9','8'].map(v => ({ value: v, label: v })) },
    { id: 'oracle', name: 'Oracle Linux', avatar: 'O', meta: 'Oracle 的企业 Linux', versions: ['10','9','8'].map(v => ({ value: v, label: v })) },
    { id: 'anolis', name: 'Anolis OS', avatar: 'AN', meta: '龙蜥社区发行版', versions: ['23','8','7'].map(v => ({ value: v, label: v })) },
    { id: 'opencloudos', name: 'OpenCloudOS', avatar: 'OC', meta: '开放云操作系统', versions: ['23','9','8'].map(v => ({ value: v, label: v })) },
    { id: 'centos', name: 'CentOS Stream', avatar: 'C', meta: 'CentOS Stream', versions: ['10','9'].map(v => ({ value: v, label: v })) },
    { id: 'fedora', name: 'Fedora', avatar: 'F', meta: '前沿 Linux 发行版', versions: [{ value: '44', label: '44', tag: '推荐' }, { value: '43', label: '43' }] },
    { id: 'openeuler', name: 'openEuler', avatar: 'OE', meta: '开源欧拉', versions: ['24.03','22.03','20.03'].map(v => ({ value: v, label: `${v} LTS` })) },
    { id: 'opensuse', name: 'openSUSE', avatar: 'S', meta: 'Leap / Tumbleweed', versions: [{ value: '16.0', label: 'Leap 16.0' }, { value: 'tumbleweed', label: 'Tumbleweed', tag: 'Rolling' }] },
    { id: 'nixos', name: 'NixOS', avatar: 'N', meta: '声明式系统配置', versions: [{ value: '26.05', label: '26.05' }] },
    { id: 'kali', name: 'Kali Linux', avatar: 'K', meta: '安全测试发行版', versions: [{ value: '', label: 'Rolling', tag: 'Rolling' }], rolling: true },
    { id: 'arch', name: 'Arch Linux', avatar: 'AR', meta: '滚动更新发行版', versions: [{ value: '', label: 'Rolling', tag: 'Rolling' }], rolling: true },
    { id: 'gentoo', name: 'Gentoo', avatar: 'G', meta: '高度可定制发行版', versions: [{ value: '', label: 'Rolling', tag: 'Rolling' }], rolling: true },
    { id: 'aosc', name: 'AOSC OS', avatar: 'AO', meta: '安同开源社区发行版', versions: [{ value: '', label: 'Rolling', tag: 'Rolling' }], rolling: true },
    { id: 'fnos', name: 'fnOS', avatar: 'FN', meta: '飞牛私有云系统', versions: [{ value: '1', label: '1' }], specialPassword: true },
    { id: 'fygoos', name: 'FygoOS', avatar: 'FY', meta: 'NAS 系统', versions: [{ value: '1', label: '1' }], specialPassword: true },
    { id: 'redhat', name: 'Red Hat Enterprise Linux', avatar: 'RH', meta: '需提供官方 QCOW2 镜像', versions: [{ value: 'image', label: '8 / 9 / 10（由镜像决定）' }], requiresImage: true }
  ];

  const REQUIREMENTS = {
    alpine: { ram: '256 MB', disk: '1 GB', note: '上游项目给出的最低安装要求。' },
    debian: { ram: '256 MB', disk: '1–1.5 GB', note: '256 MB 内存时建议至少 1.5 GB 磁盘；512 MB 内存时 1 GB 可用。' },
    kali: { ram: '256 MB', disk: '1–1.5 GB', note: '低内存机器建议预留更充足的磁盘空间。' },
    ubuntu: { ram: '512 MB', disk: '2 GB', note: '使用云镜像安装，建议实际配置高于最低值。' },
    anolis: { ram: '512 MB', disk: '5 GB', note: '使用云镜像安装。' },
    rocky: { ram: '512 MB', disk: '5 GB', note: 'RHEL 兼容发行版最低安装要求。' },
    almalinux: { ram: '512 MB', disk: '5 GB', note: 'RHEL 兼容发行版最低安装要求。' },
    oracle: { ram: '512 MB', disk: '5 GB', note: 'RHEL 兼容发行版最低安装要求。' },
    redhat: { ram: '512 MB', disk: '5 GB', note: '实际占用还取决于你提供的 QCOW2 镜像。' },
    opencloudos: { ram: '512 MB', disk: '5 GB', note: '使用云镜像安装。' },
    centos: { ram: '512 MB', disk: '5 GB', note: '使用云镜像安装。' },
    fedora: { ram: '512 MB', disk: '5 GB', note: '使用云镜像安装。' },
    openeuler: { ram: '512 MB', disk: '5 GB', note: '使用云镜像安装。' },
    opensuse: { ram: '512 MB', disk: '5 GB', note: '适用于 Leap 与 Tumbleweed。' },
    nixos: { ram: '512 MB', disk: '5 GB', note: '上游项目给出的最低安装要求。' },
    arch: { ram: '512 MB', disk: '5 GB', note: '滚动发行版，建议保留额外升级空间。' },
    gentoo: { ram: '512 MB', disk: '5 GB', note: '上游项目给出的最低安装要求。' },
    aosc: { ram: '512 MB', disk: '5 GB', note: '上游项目给出的最低安装要求。' },
    fnos: { ram: '512 MB', disk: '10 GB', note: 'NAS 系统，实际使用建议预留更多存储空间。' },
    fygoos: { ram: '512 MB', disk: '10 GB', note: 'NAS 系统，实际使用建议预留更多存储空间。' }
  };

  const WINDOWS_LANGUAGES = [
    ['zh-cn', '简体中文'], ['zh-tw', '繁體中文'], ['zh-hk', '繁體中文（香港）'], ['en-us', 'English'], ['en-gb', 'English (UK)'],
    ['ja-jp', '日本語'], ['ko-kr', '한국어'], ['de-de', 'Deutsch'], ['fr-fr', 'Français'], ['es-es', 'Español'], ['es-mx', 'Español (Latam)'],
    ['it-it', 'Italiano'], ['pt-br', 'Português (Brasil)'], ['pt-pt', 'Português'], ['ru-ru', 'Русский'], ['nl-nl', 'Nederlands'], ['pl-pl', 'Polski'],
    ['tr-tr', 'Türkçe'], ['uk-ua', 'Українська'], ['th-th', 'ไทย']
  ];

  const DOWNLOAD_URLS = {
    overseas: 'https://raw.githubusercontent.com/bin456789/reinstall/main/reinstall.sh',
    china: 'https://cnb.cool/bin456789/reinstall/-/git/raw/main/reinstall.sh'
  };

  const state = { distro: 'debian', version: '13', passwordMode: 'random', passwordVisible: false, region: 'overseas', isoMode: 'auto' };
  const $ = id => document.getElementById(id);
  let requirementsCard = null;
  let toastTimer = null;

  function currentSystem() { return SYSTEMS.find(s => s.id === state.distro) || SYSTEMS[0]; }
  function currentVersion() { return currentSystem().versions.find(v => v.value === state.version) || currentSystem().versions[0]; }
  function savePreference(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }

  function ensureWindowsFields() {
    if ($('windowsOptions')) return;
    const imageUrlGroup = $('imageUrlGroup');
    if (!imageUrlGroup) return;
    const wrapper = document.createElement('div');
    wrapper.id = 'windowsOptions';
    wrapper.className = 'windows-options hidden';
    wrapper.innerHTML = `
      <div class="field-row two-col windows-row">
        <div class="field-group">
          <label for="windowsLang">系统语言</label>
          <div class="select-native-wrap">
            <select id="windowsLang"></select>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>
          </div>
        </div>
        <div class="field-group">
          <label for="rdpPort">RDP 端口</label>
          <input class="text-input" id="rdpPort" type="number" min="1" max="65535" inputmode="numeric" value="3389" autocomplete="off">
          <p class="field-error" id="rdpPortError"></p>
        </div>
      </div>
      <div class="field-group windows-iso-group">
        <label>ISO 来源</label>
        <div class="segmented windows-iso-segmented" role="group" aria-label="Windows ISO 来源">
          <button type="button" class="segment active" data-iso-mode="auto">自动查找官方 ISO</button>
          <button type="button" class="segment" data-iso-mode="custom">自定义 ISO</button>
        </div>
        <div class="windows-custom-iso hidden" id="windowsCustomIso">
          <input class="text-input" id="windowsIsoUrl" type="text" inputmode="url" autocomplete="off" placeholder="https://...windows.iso 或 magnet:?xt=...">
          <p class="field-error" id="windowsIsoError"></p>
          <p class="field-hint" id="windowsIsoHint">自定义 ISO 必须包含当前选择的 Windows 映像名称。</p>
        </div>
        <p class="field-hint windows-auto-hint" id="windowsAutoHint">由上游脚本自动查找对应的官方原版 ISO。</p>
      </div>`;
    imageUrlGroup.insertAdjacentElement('afterend', wrapper);
    const lang = $('windowsLang');
    WINDOWS_LANGUAGES.forEach(([value, label]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      lang.appendChild(option);
    });
  }

  function restorePreferences() {
    try {
      const savedDistro = localStorage.getItem('lr-distro');
      if (SYSTEMS.some(s => s.id === savedDistro)) state.distro = savedDistro;
      const system = currentSystem();
      const savedVersion = localStorage.getItem('lr-version');
      state.version = system.versions.some(v => v.value === savedVersion) ? savedVersion : system.versions[0].value;
      const savedRegion = localStorage.getItem('lr-region');
      if (savedRegion === 'china' || savedRegion === 'overseas') state.region = savedRegion;
      const savedTheme = localStorage.getItem('lr-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      document.documentElement.dataset.theme = savedTheme;
      const port = localStorage.getItem('lr-port');
      if (port && /^\d+$/.test(port)) $('sshPort').value = port;
      const length = localStorage.getItem('lr-password-length');
      if (['16', '20', '24', '32'].includes(length)) $('passwordLength').value = length;
      const winLang = localStorage.getItem('lr-win-lang');
      if (winLang && WINDOWS_LANGUAGES.some(([value]) => value === winLang)) $('windowsLang').value = winLang;
      const rdp = localStorage.getItem('lr-win-rdp');
      if (rdp && /^\d+$/.test(rdp)) $('rdpPort').value = rdp;
      const isoMode = localStorage.getItem('lr-win-iso-mode');
      if (isoMode === 'auto' || isoMode === 'custom') state.isoMode = isoMode;
    } catch (_) {}
  }

  function secureRandomInt(max) {
    if (max <= 0) return 0;
    const buffer = new Uint32Array(1);
    const limit = 0xffffffff - (0xffffffff % max);
    do { crypto.getRandomValues(buffer); } while (buffer[0] >= limit);
    return buffer[0] % max;
  }

  function shuffleSecure(value) {
    const chars = [...value];
    for (let i = chars.length - 1; i > 0; i--) {
      const j = secureRandomInt(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
  }

  function generatePassword() {
    const length = Number($('passwordLength').value) || 20;
    const groups = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnopqrstuvwxyz', '23456789', '!@#$%^&*_-+='];
    const all = groups.join('');
    let value = groups.map(group => group[secureRandomInt(group.length)]).join('');
    while (value.length < length) value += all[secureRandomInt(all.length)];
    $('passwordInput').value = shuffleSecure(value);
    validateAndRender();
  }

  function shellQuote(value) { return `'${String(value).replace(/'/g, `'"'"'`)}'`; }
  function isValidHttpUrl(value) {
    try { const url = new URL(value); return url.protocol === 'http:' || url.protocol === 'https:'; }
    catch (_) { return false; }
  }
  function isValidIsoSource(value) { return isValidHttpUrl(value) || /^magnet:\?xt=/i.test(value); }
  function validatePassword() {
    const value = $('passwordInput').value;
    if (!value) return { ok: false, message: '请输入或生成密码。' };
    if (/[\r\n\0]/.test(value)) return { ok: false, message: '密码不能包含换行或空字符。' };
    if (value.length > 128) return { ok: false, message: '密码长度请控制在 128 个字符以内。' };
    return { ok: true, message: '' };
  }
  function validatePortValue(value, label) {
    const text = String(value).trim();
    if (!/^\d+$/.test(text)) return { ok: false, message: `${label}必须是数字。` };
    const port = Number(text);
    if (port < 1 || port > 65535) return { ok: false, message: '端口范围应为 1–65535。' };
    return { ok: true, message: '' };
  }
  function validatePort() { return validatePortValue($('sshPort').value, 'SSH 端口'); }
  function validateRdpPort() { return validatePortValue($('rdpPort').value, 'RDP 端口'); }

  function getStrength(password) {
    if (!password) return { score: 0, label: '—' };
    let score = 0;
    if (password.length >= 10) score++;
    if (password.length >= 16) score++;
    const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
    if (variety >= 3) score++;
    if (variety === 4 && password.length >= 18) score++;
    score = Math.max(1, Math.min(4, score));
    return { score, label: ['', '弱', '一般', '良好', '强'][score] };
  }

  function buildCommand(maskPassword = false) {
    const system = currentSystem();
    const version = currentVersion();
    if (!validatePassword().ok || !validatePort().ok) return '';
    if (system.requiresImage && !isValidHttpUrl($('imageUrl').value.trim())) return '';
    if (system.windows && !validateRdpPort().ok) return '';
    if (system.windows && state.isoMode === 'custom' && !isValidIsoSource($('windowsIsoUrl').value.trim())) return '';

    const args = [];
    if (system.windows) {
      args.push('windows');
      args.push(`--image-name ${shellQuote(version.imageName)}`);
      args.push(`--lang ${$('windowsLang').value}`);
      if (state.isoMode === 'custom') args.push(`--iso ${shellQuote($('windowsIsoUrl').value.trim())}`);
      args.push('--username administrator');
      args.push(`--password ${shellQuote(maskPassword ? '••••••••••••••••••••' : $('passwordInput').value)}`);
      args.push(`--rdp-port ${$('rdpPort').value.trim()}`);
      args.push(`--ssh-port ${$('sshPort').value.trim()}`);
    } else if (system.requiresImage) {
      args.push('redhat');
      args.push(`--img=${shellQuote($('imageUrl').value.trim())}`);
      args.push('--username root');
      args.push(`--password ${shellQuote(maskPassword ? '••••••••••••••••••••' : $('passwordInput').value)}`);
      args.push(`--ssh-port ${$('sshPort').value.trim()}`);
    } else {
      args.push(system.id);
      if (state.version) args.push(state.version);
      args.push('--username root');
      args.push(`--password ${shellQuote(maskPassword ? '••••••••••••••••••••' : $('passwordInput').value)}`);
      args.push(`--ssh-port ${$('sshPort').value.trim()}`);
    }

    const slash = '\\';
    const downloadUrl = DOWNLOAD_URLS[state.region];
    const lines = [`(curl -O ${downloadUrl} || wget -O reinstall.sh ${downloadUrl}) && ${slash}`];
    const target = args.shift();
    if (args.length) {
      lines.push(`  bash reinstall.sh ${target} ${slash}`);
      args.forEach((arg, index) => lines.push(`    ${arg}${index < args.length - 1 ? ` ${slash}` : ''}`));
    } else {
      lines.push(`  bash reinstall.sh ${target}`);
    }
    return lines.join('\n');
  }

  function ensureRequirementsCard() {
    if (requirementsCard) return requirementsCard;
    const panel = document.querySelector('.config-panel');
    if (!panel) return null;
    requirementsCard = document.createElement('div');
    requirementsCard.className = 'requirements-card';
    requirementsCard.innerHTML = `
      <div class="requirements-head"><span>最低配置</span><strong data-req-system>—</strong></div>
      <div class="requirements-grid">
        <div><span>最低内存</span><strong data-req-ram>—</strong></div>
        <div><span>最低磁盘</span><strong data-req-disk>—</strong></div>
      </div>
      <p data-req-note></p>`;
    panel.appendChild(requirementsCard);
    return requirementsCard;
  }

  function renderRequirements() {
    const card = ensureRequirementsCard();
    if (!card) return;
    const system = currentSystem();
    const version = currentVersion();
    const req = system.windows
      ? { ram: version.ram, disk: version.disk, note: version.note || 'Windows ISO 安装；上游会自动按需注入 VirtIO 与常见云厂商驱动。' }
      : (REQUIREMENTS[system.id] || { ram: '—', disk: '—', note: '暂无最低配置数据，请以目标系统官方要求为准。' });
    const versionText = system.requiresImage ? '8 / 9 / 10' : (system.rolling ? 'Rolling' : version.label);
    card.querySelector('[data-req-system]').textContent = system.windows ? version.label : `${system.name} ${versionText}`;
    card.querySelector('[data-req-ram]').textContent = req.ram;
    card.querySelector('[data-req-disk]').textContent = req.disk;
    card.querySelector('[data-req-note]').textContent = req.note;
  }

  function renderDistroOptions(filter = '') {
    const list = SYSTEMS.filter(system => `${system.name} ${system.id} ${system.meta}`.toLowerCase().includes(filter.trim().toLowerCase()));
    const container = $('distroOptions');
    container.innerHTML = '';
    if (!list.length) {
      container.innerHTML = '<div class="no-results">没有匹配的系统</div>';
      return;
    }
    list.forEach(system => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `distro-option${system.id === state.distro ? ' active' : ''}`;
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', system.id === state.distro ? 'true' : 'false');
      button.innerHTML = `<span class="system-avatar">${system.avatar}</span><span><strong>${system.name}</strong><small>${system.meta}</small></span>`;
      button.addEventListener('click', event => {
        event.stopPropagation();
        selectDistro(system.id);
      });
      container.appendChild(button);
    });
  }

  function applySystemLabels() {
    const system = currentSystem();
    const isWindows = !!system.windows;
    const passwordLabel = document.querySelector('.label-row label');
    const sshLabel = document.querySelector('label[for="sshPort"]');
    if (passwordLabel) passwordLabel.textContent = isWindows ? 'Administrator 密码' : 'Root 密码';
    $('passwordInput').setAttribute('aria-label', isWindows ? 'Administrator 密码' : 'Root 密码');
    if (sshLabel) sshLabel.textContent = isWindows ? '安装日志 SSH 端口' : 'SSH 端口';

    const summaryCells = document.querySelectorAll('.summary-grid > div');
    if (summaryCells.length >= 3) {
      summaryCells[1].querySelector('strong').textContent = isWindows ? 'administrator' : 'root';
      summaryCells[2].querySelector('span').textContent = isWindows ? 'RDP' : 'SSH';
    }
  }

  function renderWindowsOptions() {
    const system = currentSystem();
    const isWindows = !!system.windows;
    $('windowsOptions').classList.toggle('hidden', !isWindows);
    if (!isWindows) return;
    document.querySelectorAll('[data-iso-mode]').forEach(button => button.classList.toggle('active', button.dataset.isoMode === state.isoMode));
    $('windowsCustomIso').classList.toggle('hidden', state.isoMode !== 'custom');
    $('windowsAutoHint').classList.toggle('hidden', state.isoMode !== 'auto');
    $('windowsIsoHint').textContent = `自定义 ISO 必须包含映像：${currentVersion().imageName}`;
  }

  function renderSystem() {
    const system = currentSystem();
    $('distroAvatar').textContent = system.avatar;
    $('distroLabel').textContent = system.name;
    $('distroMeta').textContent = system.meta;
    const select = $('versionSelect');
    select.innerHTML = '';
    system.versions.forEach(version => {
      const option = document.createElement('option');
      option.value = version.value;
      option.textContent = version.tag ? `${version.label} · ${version.tag}` : version.label;
      select.appendChild(option);
    });
    if (!system.versions.some(v => v.value === state.version)) state.version = system.versions[0].value;
    select.value = state.version;
    select.disabled = system.versions.length === 1 && (system.rolling || system.requiresImage);
    $('versionHint').textContent = system.rolling ? '该发行版采用 Rolling Release，无需选择固定版本。' : (system.requiresImage ? 'RHEL 需要提供从 Red Hat 官方获取的 QCOW2 镜像地址。' : '');
    $('imageUrlGroup').classList.toggle('hidden', !system.requiresImage);
    $('specialPasswordNote').classList.toggle('hidden', !system.specialPassword);
    applySystemLabels();
    renderWindowsOptions();
    renderDistroOptions($('distroSearch').value);
    validateAndRender();
  }

  function selectDistro(id) {
    state.distro = id;
    state.version = currentSystem().versions[0].value;
    savePreference('lr-distro', state.distro);
    savePreference('lr-version', state.version);
    closeDistroMenu();
    renderSystem();
  }

  function openDistroMenu() {
    $('distroSelect').classList.add('open');
    $('distroButton').setAttribute('aria-expanded', 'true');
    setTimeout(() => $('distroSearch').focus(), 0);
  }
  function closeDistroMenu() {
    $('distroSelect').classList.remove('open');
    $('distroButton').setAttribute('aria-expanded', 'false');
    $('distroSearch').value = '';
    renderDistroOptions();
  }

  function renderStrength() {
    const result = getStrength($('passwordInput').value);
    const bars = document.querySelector('.strength-bars');
    bars.dataset.score = String(result.score);
    $('strengthText').textContent = result.label;
  }

  function validateAndRender() {
    const pass = validatePassword();
    const port = validatePort();
    const system = currentSystem();
    const imageOk = !system.requiresImage || isValidHttpUrl($('imageUrl').value.trim());
    const rdp = system.windows ? validateRdpPort() : { ok: true, message: '' };
    const isoOk = !system.windows || state.isoMode === 'auto' || isValidIsoSource($('windowsIsoUrl').value.trim());
    const valid = pass.ok && port.ok && imageOk && rdp.ok && isoOk;

    $('passwordError').textContent = pass.message;
    $('portError').textContent = port.message;
    $('rdpPortError').textContent = system.windows ? rdp.message : '';
    $('windowsIsoError').textContent = system.windows && state.isoMode === 'custom' && !isoOk ? '请输入有效的 http(s) ISO 地址或 magnet 链接。' : '';
    if (system.requiresImage) $('versionHint').textContent = imageOk || !$('imageUrl').value.trim() ? 'RHEL 需要提供从 Red Hat 官方获取的 QCOW2 镜像地址。' : '请输入有效的 http:// 或 https:// QCOW2 镜像地址。';

    const version = currentVersion();
    const versionText = system.requiresImage ? '自定义镜像' : (system.rolling ? 'Rolling' : version.label);
    $('summarySystem').textContent = system.windows ? version.label : `${system.name} ${versionText}`;
    $('summaryPort').textContent = system.windows ? (rdp.ok ? $('rdpPort').value.trim() : '—') : (port.ok ? $('sshPort').value.trim() : '—');
    $('summaryRegion').textContent = state.region === 'china' ? '中国大陆' : '海外';
    $('commandPreview').textContent = buildCommand(!state.passwordVisible) || '请完成有效配置后生成命令。';
    $('copyCommand').disabled = !valid;
    $('terminalCopy').disabled = !valid;
    $('readyBadge').classList.toggle('invalid', !valid);
    $('readyBadge').innerHTML = `<span></span> ${valid ? '命令就绪' : '请检查配置'}`;
    renderRequirements();
    renderStrength();
  }

  function setPasswordMode(mode) {
    state.passwordMode = mode;
    document.querySelectorAll('[data-password-mode]').forEach(button => button.classList.toggle('active', button.dataset.passwordMode === mode));
    $('randomTools').classList.toggle('hidden', mode !== 'random');
    if (mode === 'random') generatePassword();
    else { $('passwordInput').value = ''; $('passwordInput').focus(); validateAndRender(); }
  }
  function setRegion(region) {
    state.region = region;
    document.querySelectorAll('[data-region]').forEach(button => button.classList.toggle('active', button.dataset.region === region));
    savePreference('lr-region', region);
    validateAndRender();
  }
  function setIsoMode(mode) {
    state.isoMode = mode;
    savePreference('lr-win-iso-mode', mode);
    renderWindowsOptions();
    validateAndRender();
  }
  function setVisibility(visible) {
    state.passwordVisible = visible;
    $('passwordInput').type = visible ? 'text' : 'password';
    $('visibilityToggle').classList.toggle('password-visible', visible);
    $('visibilityToggle').setAttribute('aria-label', visible ? '隐藏密码' : '显示密码');
    validateAndRender();
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    $('toastText').textContent = message;
    $('toast').classList.add('show');
    toastTimer = setTimeout(() => $('toast').classList.remove('show'), 1800);
  }
  async function copyText(text, successMessage) {
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
      showToast(successMessage);
    } catch (_) { showToast('复制失败，请手动复制'); }
  }

  function bindEvents() {
    $('distroButton').addEventListener('click', event => {
      event.stopPropagation();
      $('distroSelect').classList.contains('open') ? closeDistroMenu() : openDistroMenu();
    });
    $('distroMenu').addEventListener('click', event => event.stopPropagation());
    $('distroSearch').addEventListener('input', event => renderDistroOptions(event.target.value));
    document.addEventListener('click', closeDistroMenu);
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeDistroMenu(); });

    $('versionSelect').addEventListener('change', () => {
      state.version = $('versionSelect').value;
      savePreference('lr-version', state.version);
      renderWindowsOptions();
      validateAndRender();
    });
    $('imageUrl').addEventListener('input', validateAndRender);
    document.querySelectorAll('[data-password-mode]').forEach(button => button.addEventListener('click', () => setPasswordMode(button.dataset.passwordMode)));
    document.querySelectorAll('[data-region]').forEach(button => button.addEventListener('click', () => setRegion(button.dataset.region)));
    document.querySelectorAll('[data-iso-mode]').forEach(button => button.addEventListener('click', () => setIsoMode(button.dataset.isoMode)));
    $('windowsLang').addEventListener('change', () => { savePreference('lr-win-lang', $('windowsLang').value); validateAndRender(); });
    $('rdpPort').addEventListener('input', () => { savePreference('lr-win-rdp', $('rdpPort').value); validateAndRender(); });
    $('rdpPort').addEventListener('blur', () => { if (!$('rdpPort').value.trim()) $('rdpPort').value = '3389'; validateAndRender(); });
    $('windowsIsoUrl').addEventListener('input', validateAndRender);
    $('passwordInput').addEventListener('input', validateAndRender);
    $('passwordInput').addEventListener('paste', () => setTimeout(validateAndRender, 0));
    $('passwordLength').addEventListener('change', () => {
      savePreference('lr-password-length', $('passwordLength').value);
      if (state.passwordMode === 'random') generatePassword();
    });
    $('regeneratePassword').addEventListener('click', generatePassword);
    $('visibilityToggle').addEventListener('click', () => setVisibility(!state.passwordVisible));
    $('copyPassword').addEventListener('click', () => validatePassword().ok ? copyText($('passwordInput').value, '密码已复制') : showToast('请先输入或生成密码'));
    $('sshPort').addEventListener('input', () => { savePreference('lr-port', $('sshPort').value); validateAndRender(); });
    $('sshPort').addEventListener('blur', () => { if (!$('sshPort').value.trim()) $('sshPort').value = '22'; validateAndRender(); });
    $('copyCommand').addEventListener('click', () => { const command = buildCommand(false); if (command) copyText(command, '完整重装命令已复制'); });
    $('terminalCopy').addEventListener('click', () => { const command = buildCommand(false); if (command) copyText(command, '完整重装命令已复制'); });
    $('copyReset').addEventListener('click', () => copyText('bash reinstall.sh reset', '取消命令已复制'));
    $('themeToggle').addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      savePreference('lr-theme', next);
    });
  }

  function init() {
    ensureWindowsFields();
    restorePreferences();
    renderSystem();
    setRegion(state.region);
    bindEvents();
    generatePassword();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();