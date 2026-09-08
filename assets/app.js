(() => {
  'use strict';

  const SYSTEMS = [
    { id: 'debian', name: 'Debian', avatar: 'D', meta: '稳定、轻量、常用', versions: [
      { value: '13', label: '13', tag: '推荐' }, { value: '12', label: '12', tag: '稳定' }, { value: '11', label: '11', tag: 'ELTS' }, { value: '10', label: '10', tag: 'ELTS' }, { value: '9', label: '9', tag: 'ELTS' }
    ]},
    { id: 'ubuntu', name: 'Ubuntu', avatar: 'U', meta: '主流云服务器发行版', versions: [
      { value: '26.04', label: '26.04 LTS', tag: '新 LTS' }, { value: '24.04', label: '24.04 LTS', tag: '推荐' }, { value: '22.04', label: '22.04 LTS', tag: '稳定' }, { value: '20.04', label: '20.04 LTS' }, { value: '18.04', label: '18.04 LTS', tag: '旧版' }
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

  const DOWNLOAD_URLS = {
    overseas: 'https://raw.githubusercontent.com/bin456789/reinstall/main/reinstall.sh',
    china: 'https://cnb.cool/bin456789/reinstall/-/git/raw/main/reinstall.sh'
  };

  const state = {
    distro: 'debian',
    version: '13',
    passwordMode: 'random',
    passwordVisible: false,
    region: 'overseas'
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    distroSelect: $('distroSelect'), distroButton: $('distroButton'), distroMenu: $('distroMenu'), distroOptions: $('distroOptions'), distroSearch: $('distroSearch'),
    distroAvatar: $('distroAvatar'), distroLabel: $('distroLabel'), distroMeta: $('distroMeta'), versionSelect: $('versionSelect'), versionHint: $('versionHint'),
    imageUrlGroup: $('imageUrlGroup'), imageUrl: $('imageUrl'), passwordInput: $('passwordInput'), passwordLength: $('passwordLength'), randomTools: $('randomTools'),
    regeneratePassword: $('regeneratePassword'), copyPassword: $('copyPassword'), visibilityToggle: $('visibilityToggle'), passwordError: $('passwordError'), specialPasswordNote: $('specialPasswordNote'),
    sshPort: $('sshPort'), portError: $('portError'), summarySystem: $('summarySystem'), summaryPort: $('summaryPort'), summaryRegion: $('summaryRegion'),
    commandPreview: $('commandPreview'), copyCommand: $('copyCommand'), terminalCopy: $('terminalCopy'), copyReset: $('copyReset'), readyBadge: $('readyBadge'),
    themeToggle: $('themeToggle'), toast: $('toast'), toastText: $('toastText')
  };

  function currentSystem() { return SYSTEMS.find(s => s.id === state.distro) || SYSTEMS[0]; }
  function currentVersion() { return currentSystem().versions.find(v => v.value === state.version) || currentSystem().versions[0]; }

  function restorePreferences() {
    try {
      const savedDistro = localStorage.getItem('lr-distro');
      const savedVersion = localStorage.getItem('lr-version');
      const savedPort = localStorage.getItem('lr-port');
      const savedRegion = localStorage.getItem('lr-region');
      const savedLength = localStorage.getItem('lr-password-length');
      const savedTheme = localStorage.getItem('lr-theme');

      if (SYSTEMS.some(s => s.id === savedDistro)) state.distro = savedDistro;
      const system = currentSystem();
      state.version = system.versions.some(v => v.value === savedVersion) ? savedVersion : system.versions[0].value;
      if (savedPort && /^\d+$/.test(savedPort)) els.sshPort.value = savedPort;
      if (savedRegion === 'china' || savedRegion === 'overseas') state.region = savedRegion;
      if (['16','20','24','32'].includes(savedLength)) els.passwordLength.value = savedLength;

      let theme = savedTheme;
      if (!theme) theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      document.documentElement.dataset.theme = theme;
    } catch (_) { /* localStorage may be unavailable */ }
  }

  function savePreference(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  }

  function secureRandomInt(max) {
    if (max <= 0) return 0;
    const maxUint = 0xffffffff;
    const limit = maxUint - (maxUint % max);
    const buf = new Uint32Array(1);
    do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
    return buf[0] % max;
  }

  function shuffleSecure(chars) {
    const arr = [...chars];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = secureRandomInt(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }

  function generatePassword() {
    const length = Number(els.passwordLength.value) || 20;
    const groups = [
      'ABCDEFGHJKLMNPQRSTUVWXYZ',
      'abcdefghijkmnopqrstuvwxyz',
      '23456789',
      '!@#$%^&*_-+=' 
    ];
    const all = groups.join('');
    let output = groups.map(group => group[secureRandomInt(group.length)]).join('');
    while (output.length < length) output += all[secureRandomInt(all.length)];
    els.passwordInput.value = shuffleSecure(output);
    validateAndRender();
  }

  function shellQuote(value) {
    return `'${String(value).replace(/'/g, `'"'"'`)}'`;
  }

  function isValidHttpUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch (_) { return false; }
  }

  function validatePassword() {
    const value = els.passwordInput.value;
    if (!value) return { ok: false, message: '请输入或生成密码。' };
    if (/[\r\n\0]/.test(value)) return { ok: false, message: '密码不能包含换行或空字符。' };
    if (value.length > 128) return { ok: false, message: '密码长度请控制在 128 个字符以内。' };
    return { ok: true, message: '' };
  }

  function validatePort() {
    const value = String(els.sshPort.value).trim();
    if (!/^\d+$/.test(value)) return { ok: false, message: 'SSH 端口必须是数字。' };
    const port = Number(value);
    if (port < 1 || port > 65535) return { ok: false, message: '端口范围应为 1–65535。' };
    return { ok: true, message: '' };
  }

  function getStrength(password) {
    if (!password) return { score: 0, label: '—' };
    let score = 0;
    if (password.length >= 10) score++;
    if (password.length >= 16) score++;
    const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
    if (variety >= 3) score++;
    if (variety === 4 && password.length >= 18) score++;
    score = Math.min(4, Math.max(1, score));
    return { score, label: ['','弱','一般','良好','强'][score] };
  }

  function buildCommand(maskPassword = false) {
    const system = currentSystem();
    const pass = validatePassword();
    const port = validatePort();
    if (!pass.ok || !port.ok) return '';

    if (system.requiresImage && !isValidHttpUrl(els.imageUrl.value.trim())) return '';

    const downloadUrl = DOWNLOAD_URLS[state.region];
    const displayPassword = maskPassword ? '••••••••••••••••••••' : els.passwordInput.value;
    const args = [];

    if (system.requiresImage) {
      args.push('redhat');
      args.push(`--img=${shellQuote(els.imageUrl.value.trim())}`);
    } else {
      args.push(system.id);
      if (state.version) args.push(state.version);
    }

    args.push('--username root');
    args.push(`--password ${shellQuote(displayPassword)}`);
    args.push(`--ssh-port ${els.sshPort.value.trim()}`);

    return `(curl -O ${downloadUrl} || wget -O reinstall.sh ${downloadUrl}) && \\\n  bash reinstall.sh ${args.join(' \\\n    ')}`;
  }

  function renderDistroOptions(filter = '') {
    const keyword = filter.trim().toLowerCase();
    const list = SYSTEMS.filter(s => `${s.name} ${s.id} ${s.meta}`.toLowerCase().includes(keyword));
    els.distroOptions.innerHTML = '';
    if (!list.length) {
      const empty = document.createElement('div');
      empty.className = 'no-results';
      empty.textContent = '没有匹配的发行版';
      els.distroOptions.appendChild(empty);
      return;
    }
    list.forEach(system => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `distro-option${system.id === state.distro ? ' active' : ''}`;
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', system.id === state.distro ? 'true' : 'false');
      button.innerHTML = `<span class="system-avatar">${system.avatar}</span><span><strong>${system.name}</strong><small>${system.meta}</small></span>`;
      button.addEventListener('click', () => selectDistro(system.id));
      els.distroOptions.appendChild(button);
    });
  }

  function renderSystem() {
    const system = currentSystem();
    els.distroAvatar.textContent = system.avatar;
    els.distroLabel.textContent = system.name;
    els.distroMeta.textContent = system.meta;
    els.versionSelect.innerHTML = '';

    system.versions.forEach(version => {
      const opt = document.createElement('option');
      opt.value = version.value;
      opt.textContent = version.tag ? `${version.label} · ${version.tag}` : version.label;
      els.versionSelect.appendChild(opt);
    });
    if (!system.versions.some(v => v.value === state.version)) state.version = system.versions[0].value;
    els.versionSelect.value = state.version;
    els.versionSelect.disabled = system.versions.length === 1 && (system.rolling || system.requiresImage);

    if (system.rolling) els.versionHint.textContent = '该发行版采用 Rolling Release，无需选择固定版本。';
    else if (system.requiresImage) els.versionHint.textContent = 'RHEL 需要提供从 Red Hat 官方获取的 QCOW2 镜像地址。';
    else els.versionHint.textContent = '';

    els.imageUrlGroup.classList.toggle('hidden', !system.requiresImage);
    els.specialPasswordNote.classList.toggle('hidden', !system.specialPassword);
    renderDistroOptions(els.distroSearch.value);
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
    els.distroSelect.classList.add('open');
    els.distroButton.setAttribute('aria-expanded', 'true');
    setTimeout(() => els.distroSearch.focus(), 0);
  }
  function closeDistroMenu() {
    els.distroSelect.classList.remove('open');
    els.distroButton.setAttribute('aria-expanded', 'false');
    els.distroSearch.value = '';
    renderDistroOptions();
  }

  function renderStrength() {
    const result = getStrength(els.passwordInput.value);
    const bars = document.querySelector('.strength-bars');
    bars.dataset.score = String(result.score);
    $('strengthText').textContent = result.label;
  }

  function validateAndRender() {
    const pass = validatePassword();
    const port = validatePort();
    const system = currentSystem();
    const imageOk = !system.requiresImage || isValidHttpUrl(els.imageUrl.value.trim());
    const valid = pass.ok && port.ok && imageOk;

    els.passwordError.textContent = pass.message;
    els.portError.textContent = port.message;
    if (system.requiresImage && els.imageUrl.value.trim() && !imageOk) {
      els.versionHint.textContent = '请输入有效的 http:// 或 https:// QCOW2 镜像地址。';
    } else if (system.requiresImage) {
      els.versionHint.textContent = 'RHEL 需要提供从 Red Hat 官方获取的 QCOW2 镜像地址。';
    }

    const version = currentVersion();
    const versionText = system.requiresImage ? '自定义镜像' : (system.rolling ? 'Rolling' : version.label);
    els.summarySystem.textContent = `${system.name} ${versionText}`;
    els.summaryPort.textContent = port.ok ? els.sshPort.value.trim() : '—';
    els.summaryRegion.textContent = state.region === 'china' ? '中国大陆' : '海外';

    const masked = !state.passwordVisible;
    const preview = buildCommand(masked);
    els.commandPreview.textContent = preview || '请完成有效配置后生成命令。';
    els.copyCommand.disabled = !valid;
    els.terminalCopy.disabled = !valid;
    els.readyBadge.classList.toggle('invalid', !valid);
    els.readyBadge.innerHTML = `<span></span> ${valid ? 'READY' : 'CHECK'}`;
    renderStrength();
  }

  function setPasswordMode(mode) {
    state.passwordMode = mode;
    document.querySelectorAll('[data-password-mode]').forEach(btn => btn.classList.toggle('active', btn.dataset.passwordMode === mode));
    els.randomTools.classList.toggle('hidden', mode !== 'random');
    if (mode === 'random') generatePassword();
    else {
      els.passwordInput.value = '';
      els.passwordInput.focus();
      validateAndRender();
    }
  }

  function setRegion(region) {
    state.region = region;
    document.querySelectorAll('[data-region]').forEach(btn => btn.classList.toggle('active', btn.dataset.region === region));
    savePreference('lr-region', region);
    validateAndRender();
  }

  function setVisibility(visible) {
    state.passwordVisible = visible;
    els.passwordInput.type = visible ? 'text' : 'password';
    els.visibilityToggle.classList.toggle('password-visible', visible);
    els.visibilityToggle.setAttribute('aria-label', visible ? '隐藏密码' : '显示密码');
    validateAndRender();
  }

  async function copyText(text, successMessage) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const area = document.createElement('textarea');
        area.value = text; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0';
        document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove();
      }
      showToast(successMessage);
      return true;
    } catch (_) {
      showToast('复制失败，请手动复制');
      return false;
    }
  }

  let toastTimer;
  function showToast(message) {
    clearTimeout(toastTimer);
    els.toastText.textContent = message;
    els.toast.classList.add('show');
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 1800);
  }

  function copyCommand() {
    const command = buildCommand(false);
    if (command) copyText(command, '完整重装命令已复制');
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    savePreference('lr-theme', next);
  }

  function bindEvents() {
    els.distroButton.addEventListener('click', () => els.distroSelect.classList.contains('open') ? closeDistroMenu() : openDistroMenu());
    els.distroSearch.addEventListener('input', e => renderDistroOptions(e.target.value));
    document.addEventListener('click', e => { if (!els.distroSelect.contains(e.target)) closeDistroMenu(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDistroMenu(); });

    els.versionSelect.addEventListener('change', () => {
      state.version = els.versionSelect.value;
      savePreference('lr-version', state.version);
      validateAndRender();
    });
    els.imageUrl.addEventListener('input', validateAndRender);

    document.querySelectorAll('[data-password-mode]').forEach(btn => btn.addEventListener('click', () => setPasswordMode(btn.dataset.passwordMode)));
    document.querySelectorAll('[data-region]').forEach(btn => btn.addEventListener('click', () => setRegion(btn.dataset.region)));

    els.passwordInput.addEventListener('input', validateAndRender);
    els.passwordInput.addEventListener('paste', () => setTimeout(validateAndRender, 0));
    els.passwordLength.addEventListener('change', () => {
      savePreference('lr-password-length', els.passwordLength.value);
      if (state.passwordMode === 'random') generatePassword();
    });
    els.regeneratePassword.addEventListener('click', generatePassword);
    els.visibilityToggle.addEventListener('click', () => setVisibility(!state.passwordVisible));
    els.copyPassword.addEventListener('click', () => {
      if (validatePassword().ok) copyText(els.passwordInput.value, '密码已复制');
      else showToast('请先输入或生成密码');
    });

    els.sshPort.addEventListener('input', () => {
      savePreference('lr-port', els.sshPort.value);
      validateAndRender();
    });
    els.sshPort.addEventListener('blur', () => {
      if (!els.sshPort.value.trim()) els.sshPort.value = '22';
      validateAndRender();
    });

    els.copyCommand.addEventListener('click', copyCommand);
    els.terminalCopy.addEventListener('click', copyCommand);
    els.copyReset.addEventListener('click', () => copyText('bash reinstall.sh reset', '取消命令已复制'));
    els.themeToggle.addEventListener('click', toggleTheme);
  }

  function init() {
    restorePreferences();
    renderSystem();
    setRegion(state.region);
    bindEvents();
    generatePassword();
  }

  init();
})();
