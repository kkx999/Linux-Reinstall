(() => {
  'use strict';

  const readyBadge = document.getElementById('readyBadge');
  if (!readyBadge) return;

  const syncReadyBadge = () => {
    const invalid = readyBadge.classList.contains('invalid');
    const label = invalid ? '请检查配置' : '命令就绪';
    if (readyBadge.textContent.trim() !== label) {
      readyBadge.innerHTML = `<span></span> ${label}`;
    }
  };

  const observer = new MutationObserver(syncReadyBadge);
  observer.observe(readyBadge, {
    attributes: true,
    attributeFilter: ['class'],
    childList: true,
    subtree: true
  });

  syncReadyBadge();
})();
