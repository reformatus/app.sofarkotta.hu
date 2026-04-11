let selectedDownloadTrack = 'stable';
let downloadPopoverInstances = [];

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
  const version = track?.version ?? 'Nincs';
  return `
    <div class="track-tab${selected ? ' selected' : ''}${track ? '' : ' disabled'}">
      <button
        type="button"
        class="track-tab-select"
        data-track-id="${trackId}"
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
      <div><strong>Fájl:</strong> ${escapeHtml(option.fileName ?? option.name ?? '')}</div>
      <div><strong>Méret:</strong> ${escapeHtml(option.sizeLabel ?? 'Ismeretlen')}</div>
      <div><strong>Letöltés:</strong> ${escapeHtml(option.downloadCountLabel ?? '0 letöltés')}</div>
    </div>
  `;
}

function buildPlatformRows(track) {
  return Object.entries(track.platforms)
    .map(([, platform]) => {
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
        <div class="download-row${hasAnyOption ? '' : ' disabled'}">
          <div class="platform-icon">
            <span class="material-icons">${platform.icon}</span>
          </div>
          <div class="download-info">
            <div class="platform-name">${escapeHtml(platform.name)}</div>
          </div>
          <div class="download-options">${hasAnyOption ? optionMarkup : ''}</div>
        </div>
      `;
    })
    .join('');
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
      <form method="dialog" class="release-details-close-row">
        <button class="release-details-close" type="submit" aria-label="Bezárás">
          <span class="material-icons">close</span>
        </button>
      </form>
      <div class="release-details-header">
        <div class="release-details-track" id="releaseDetailsTrack"></div>
        <h3 class="release-details-title" id="releaseDetailsTitle"></h3>
        <div class="release-details-tag" id="releaseDetailsTag"></div>
      </div>
      <div class="release-details-body" id="releaseDetailsBody"></div>
      <a class="release-details-link" id="releaseDetailsLink" href="#" target="_blank" rel="noreferrer">Megnyitás a GitHubon</a>
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
      dialog.close();
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
  document.getElementById('releaseDetailsTrack').textContent = track.title;
  document.getElementById('releaseDetailsTitle').textContent = track.release.title || track.version;
  document.getElementById('releaseDetailsTag').textContent = track.release.tag || track.version;
  document.getElementById('releaseDetailsBody').innerHTML =
    track.release.descriptionHtml || '<p>Nincs kiadási leírás.</p>';

  const link = document.getElementById('releaseDetailsLink');
  link.href = track.release.url;
  link.textContent = 'Megnyitás a GitHubon';

  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', 'open');
  }
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

function renderDownloadTrackContent(containerElement, track) {
  const contentElement = containerElement.querySelector('#downloadTrackContent');
  if (!contentElement) {
    return;
  }
  contentElement.innerHTML = track
    ? `<div class="download-rows">${buildPlatformRows(track) || formatEmptyState()}</div>`
    : formatEmptyState();
}

function renderDownloadPanel(containerId, includeCancel = false) {
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

  renderDownloadTrackContent(containerElement, track);

  containerElement.querySelectorAll('[data-track-id]').forEach((button) => {
    button.addEventListener('click', () => {
      setSelectedDownloadTrack(button.getAttribute('data-track-id'));
      renderDownloadPanel(containerId, includeCancel);
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
  renderDownloadPanel(containerId, includeCancel);
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
  renderDownloadPanel('dialogDownloadOptions', true);
  document.getElementById('storeDialog').classList.add('show');
}

function closeDialog() {
  destroyDownloadPopovers();
  document.getElementById('storeDialog').classList.remove('show');
}
