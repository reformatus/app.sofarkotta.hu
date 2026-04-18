let selectedDownloadTrack = 'stable';
let downloadPopoverInstances = [];
const STACKED_TRACK_TABS_MAX_WIDTH = 420;

function syncAllTrackTabLayouts() {
  document.querySelectorAll('.download-track-shell').forEach((shell) => {
    const container = shell.parentElement;
    if (container) {
      syncTrackTabLayout(container);
    }
  });
}

function getDownloadConfig() {
  return window.sofarSharedConfig?.downloads ?? { tracks: {} };
}

function getTracks() {
  const downloads = getDownloadConfig();
  const stable = downloads.tracks?.stable ?? null;
  const prerelease = downloads.tracks?.prerelease ?? null;
  return { stable, prerelease };
}

function getAvailableTrack(trackId) {
  const { stable, prerelease } = getTracks();
  if (!stable && prerelease) {
    return prerelease;
  }
  if (trackId === 'prerelease' && prerelease) {
    return prerelease;
  }
  return stable;
}

function setSelectedDownloadTrack(trackId) {
  selectedDownloadTrack = getAvailableTrack(trackId)?.id ?? 'stable';
}

function detectPlatform() {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();

  try {
    if (
      /iphone|ipad|ipod/.test(userAgent) ||
      (/safari/.test(userAgent) &&
        /apple computer/.test(userAgent) &&
        navigator.maxTouchPoints > 1)
    ) {
      return 'ios';
    }
    if (/android/.test(userAgent)) {
      return 'android';
    }
    if (
      (/mac/.test(platform) || /apple computer/.test(userAgent)) &&
      !/iphone|ipad|ipod/.test(userAgent) &&
      (navigator.maxTouchPoints === 0 || navigator.maxTouchPoints === undefined)
    ) {
      return 'macos';
    }
    if (/win/.test(platform) || /windows nt/.test(userAgent) || /windows/.test(userAgent)) {
      return 'windows';
    }
    if (/linux/.test(platform) || /linux/.test(userAgent)) {
      return 'linux';
    }
  } catch (error) {
    console.error('Error during platform detection:', error);
  }

  return null;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createTrackHeaderMarkup(trackId, track, fallbackTitle) {
  const selected = track?.id === selectedDownloadTrack;
  const version = track?.release?.displayTag ?? track?.version ?? 'Nincs';
  return `
    <div
      class="track-tab${selected ? ' selected' : ''}${track ? '' : ' disabled'}"
      data-track-id="${trackId}"
      ${track ? '' : 'aria-disabled="true"'}
    >
      <button
        type="button"
        class="track-tab-select"
        ${track ? '' : 'disabled'}
      >
        <span class="track-tab-title">${fallbackTitle}</span>
        <span class="track-tab-version">${escapeHtml(version)}</span>
      </button>
      <button
        type="button"
        class="track-info-button"
        data-track-info="${trackId}"
        aria-label="${fallbackTitle} részletei"
        ${track ? '' : 'disabled'}
      >
        <span class="material-icons">info</span>
      </button>
    </div>
  `;
}

function createTrackToggleMarkup() {
  const { stable, prerelease } = getTracks();

  return `
    <div class="download-track-shell">
      <div class="download-track-tabs">
        ${createTrackHeaderMarkup('stable', stable, 'Kiadott verzió')}
        ${createTrackHeaderMarkup('prerelease', prerelease, 'Tesztverzió')}
      </div>
      <div class="download-track-content" id="downloadTrackContent"></div>
    </div>
  `;
}

function formatEmptyState() {
  return `
    <div class="download-empty-state">
      Ehhez a csatornához most nincs elérhető letöltés.
    </div>
  `;
}

function createDownloadPopoverContent(option) {
  return `
    <div class="download-popover-content">
      <div class="download-popover-file">${escapeHtml(option.fileName ?? option.name ?? '')}</div>
      <div class="download-popover-meta">
        <span class="download-popover-chip">
          <span class="material-icons">download</span>
          <span>${escapeHtml(String(option.downloadCount ?? 0))}</span>
        </span>
        <span class="download-popover-chip">
          <span class="material-icons">description</span>
          <span>${escapeHtml(option.sizeLabel ?? 'Ismeretlen')}</span>
        </span>
      </div>
    </div>
  `;
}

function buildPlatformRows(track, preferredPlatformId = null) {
  const entries = Object.entries(track.platforms);
  const preferredEntry = preferredPlatformId
    ? entries.find(([platformId]) => platformId === preferredPlatformId) ?? null
    : null;
  const remainingEntries = preferredEntry
    ? entries.filter(([platformId]) => platformId !== preferredPlatformId)
    : entries;

  const renderRow = ([, platform], featured = false) => {
    const storeOptions = platform.storeOptions ?? [];
    const downloadOptions = platform.downloadOptions ?? [];
    const hasAnyOption = storeOptions.length > 0 || downloadOptions.length > 0;

    const optionMarkup = [
      ...storeOptions.map(
        (option) => `
          <a class="download-option primary store-option" href="${option.url}" target="_blank" rel="noreferrer">
            <span class="material-icons">storefront</span>
            <span class="download-option-title">${escapeHtml(option.name)}</span>
          </a>
        `,
      ),
      ...downloadOptions.map(
        (option) => `
          <a
            class="download-option direct-download-option"
            href="${option.url}"
            target="_blank"
            rel="noreferrer"
            data-popover-content="${escapeHtml(createDownloadPopoverContent(option))}"
          >
            <span class="material-icons">download</span>
            <span class="download-option-title">${escapeHtml(option.name)}</span>
          </a>
        `,
      ),
    ].join('');

    return `
      <div class="download-row${hasAnyOption ? '' : ' disabled'}${featured ? ' featured' : ''}">
        <div class="platform-icon">
          <span class="material-icons">${platform.icon}</span>
        </div>
        <div class="download-info">
          <div class="platform-name">${escapeHtml(platform.name)}</div>
        </div>
        <div class="download-options">${hasAnyOption ? optionMarkup : ''}</div>
      </div>
    `;
  };

  return {
    preferredMarkup: preferredEntry ? renderRow(preferredEntry, true) : '',
    remainingMarkup: remainingEntries
    .map(([, platform]) => {
      return renderRow([null, platform], false);
    })
    .join(''),
  };
}

function buildPreferredPlatformMarkup(track) {
  const platformId = detectPlatform();
  const preferredOption = platformId ? getPreferredPlatformOption(platformId) : null;
  if (!platformId || !preferredOption || preferredOption.emphasis === 'none') {
    return '';
  }

  const { preferredMarkup } = buildPlatformRows(track, platformId);
  return preferredMarkup;
}

function ensureReleaseDetailsDialog() {
  let dialog = document.getElementById('releaseDetailsDialog');
  if (dialog) {
    return dialog;
  }

  dialog = document.createElement('dialog');
  dialog.id = 'releaseDetailsDialog';
  dialog.className = 'release-details-dialog';
  dialog.innerHTML = `
    <div class="release-details-panel">
      <div class="release-details-header">
        <div class="release-details-heading">
          <h3 class="release-details-title" id="releaseDetailsTitle"></h3>
          <div class="release-details-tag" id="releaseDetailsTag"></div>
        </div>
        <div class="release-details-actions">
          <a class="release-details-link" id="releaseDetailsLink" href="#" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M12 .5A12 12 0 0 0 8.2 23.9c.6.1.8-.2.8-.6v-2.2c-3.4.7-4.1-1.4-4.1-1.4-.6-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.6-1.4-5.6-6A4.7 4.7 0 0 1 6.4 8c-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.4 1.3a11.5 11.5 0 0 1 6.2 0c2.3-1.6 3.4-1.3 3.4-1.3.7 1.7.3 2.9.1 3.2a4.7 4.7 0 0 1 1.3 3.3c0 4.6-2.9 5.7-5.7 6 .5.4.9 1.1.9 2.3v3.4c0 .4.2.7.8.6A12 12 0 0 0 12 .5Z"/>
            </svg>
            <span>Megnyitás a GitHubon</span>
          </a>
          <button class="release-details-close" type="button" aria-label="Bezárás" onclick="closeReleaseDetails()">
            <span class="material-icons">close</span>
          </button>
        </div>
      </div>
      <div class="release-details-body" id="releaseDetailsBody"></div>
    </div>
  `;
  dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    const clickedBackdrop =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (clickedBackdrop) {
      closeReleaseDetails();
    }
  });
  document.body.appendChild(dialog);
  return dialog;
}

function showReleaseDetails(trackId) {
  const track = getTracks()[trackId];
  if (!track?.release) {
    return;
  }

  const dialog = ensureReleaseDetailsDialog();
  document.getElementById('releaseDetailsTitle').textContent = track.release.title || track.version;
  document.getElementById('releaseDetailsTag').textContent =
    track.release.displayTag || track.version || track.release.tag;
  document.getElementById('releaseDetailsBody').innerHTML =
    track.release.descriptionHtml || '<p>Nincs kiadási leírás.</p>';

  const link = document.getElementById('releaseDetailsLink');
  link.href = track.release.url;
  link.textContent = 'Megnyitás a GitHubon';

  dialog.classList.remove('is-closing');
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', 'open');
  }
}

function closeReleaseDetails() {
  const dialog = document.getElementById('releaseDetailsDialog');
  if (!dialog || !dialog.hasAttribute('open')) {
    return;
  }

  dialog.classList.add('is-closing');
  window.setTimeout(() => {
    dialog.classList.remove('is-closing');
    dialog.close();
  }, 180);
}

function syncTrackTabLayout(containerElement) {
  const tabs = containerElement.querySelector('.download-track-tabs');
  if (!tabs) {
    return;
  }

  const width = Math.round(tabs.getBoundingClientRect().width);
  tabs.dataset.layout = width > 0 && width <= STACKED_TRACK_TABS_MAX_WIDTH ? 'stacked' : 'inline';
}

function destroyDownloadPopovers() {
  if (!downloadPopoverInstances.length) {
    return;
  }
  downloadPopoverInstances.forEach((instance) => instance.destroy());
  downloadPopoverInstances = [];
}

function initializeDownloadPopovers(containerElement) {
  destroyDownloadPopovers();
  if (typeof window.tippy !== 'function') {
    return;
  }

  const elements = containerElement.querySelectorAll('.direct-download-option[data-popover-content]');
  downloadPopoverInstances = Array.from(elements).map((element) =>
    window.tippy(element, {
      content: element.getAttribute('data-popover-content'),
      allowHTML: true,
      interactive: false,
      maxWidth: 280,
      placement: 'top',
      theme: 'light-border',
      delay: [120, 60],
    }),
  );
}

function renderDownloadTrackContent(containerElement, track, options = {}) {
  const contentElement = containerElement.querySelector('#downloadTrackContent');
  if (!contentElement) {
    return;
  }
  if (!track) {
    contentElement.innerHTML = formatEmptyState();
    return;
  }

  const preferredPlatformId = options.surfacePreferred
    ? (() => {
        const platformId = detectPlatform();
        const preferredOption = platformId ? getPreferredPlatformOption(platformId) : null;
        return preferredOption && preferredOption.emphasis !== 'none' ? platformId : null;
      })()
    : null;
  const { preferredMarkup, remainingMarkup } = buildPlatformRows(track, preferredPlatformId);

  contentElement.innerHTML = `
    ${
      preferredMarkup
        ? `
      <div class="download-priority-block">
        ${preferredMarkup}
      </div>
      <div class="download-secondary-title">További platformok</div>
    `
        : ''
    }
    <div class="download-rows">${remainingMarkup || formatEmptyState()}</div>
  `;
}

function renderDownloadPanel(containerId, includeCancel = false, options = {}) {
  const containerElement = document.getElementById(containerId);
  if (!containerElement) {
    return;
  }

  const track = getAvailableTrack(selectedDownloadTrack);

  containerElement.innerHTML = `
    ${createTrackToggleMarkup()}
    ${
      includeCancel
        ? `
      <button class="store-btn cancel-btn" type="button" onclick="closeDialog()">
        <span class="material-icons">close</span>Mégse
      </button>
    `
        : ''
    }
  `;

  renderDownloadTrackContent(containerElement, track, options);
  syncTrackTabLayout(containerElement);

  containerElement.querySelectorAll('[data-track-id]').forEach((button) => {
    button.addEventListener('click', (event) => {
      if (event.target.closest('[data-track-info]') || button.classList.contains('disabled')) {
        return;
      }
      setSelectedDownloadTrack(button.getAttribute('data-track-id'));
      renderDownloadPanel(containerId, includeCancel, options);
      if (typeof updateDownloadButton === 'function') {
        updateDownloadButton();
      }
    });
  });

  containerElement.querySelectorAll('[data-track-info]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      showReleaseDetails(button.getAttribute('data-track-info'));
    });
  });

  initializeDownloadPopovers(containerElement);
}

function generateDownloadRows(containerId, includeCancel = false) {
  const downloads = getDownloadConfig();
  setSelectedDownloadTrack(downloads.defaultTrack ?? 'stable');
  renderDownloadPanel(containerId, includeCancel, {
    surfacePreferred: !includeCancel,
  });
}

function getPreferredPlatformOption(platformId) {
  const track = getAvailableTrack(selectedDownloadTrack);
  const platform = track?.platforms?.[platformId];
  if (!platform) {
    return null;
  }

  const storeOption = (platform.storeOptions ?? [])[0];
  if (storeOption) {
    return { ...storeOption, emphasis: 'store', track };
  }

  const downloadOption = (platform.downloadOptions ?? [])[0];
  if (downloadOption) {
    return { ...downloadOption, emphasis: 'download', track };
  }

  return { emphasis: 'none', track };
}

function showStoreDialog() {
  const dialog = document.getElementById('storeDialog');
  if (!dialog) {
    return;
  }
  dialog.classList.remove('is-closing');
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', 'open');
  }
  renderDownloadPanel('dialogDownloadOptions', true);
  window.requestAnimationFrame(() => {
    syncAllTrackTabLayouts();
  });
}

function closeDialog() {
  destroyDownloadPopovers();
  const dialog = document.getElementById('storeDialog');
  if (!dialog || !dialog.hasAttribute('open')) {
    return;
  }
  dialog.classList.add('is-closing');
  window.setTimeout(() => {
    dialog.classList.remove('is-closing');
    dialog.close();
  }, 180);
}

window.addEventListener('resize', () => {
  syncAllTrackTabLayouts();
});
