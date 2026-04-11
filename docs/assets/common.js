let selectedDownloadTrack = 'stable';

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

function createTrackToggleMarkup() {
  const { stable, prerelease } = getTracks();
  const currentTrack = getAvailableTrack(selectedDownloadTrack);
  if (!currentTrack) {
    return '';
  }
  const cardModels = [
    stable
      ? stable
      : {
          id: 'stable',
          title: 'Stabil kiadás',
          description: 'Jelenleg nincs nyilvános stabil kiadás.',
          version: 'Nincs aktív stabil kiadás',
          releaseUrl: currentTrack.releaseUrl,
          disabled: true,
        },
    prerelease
      ? prerelease
      : {
          id: 'prerelease',
          title: 'Előzetes kiadás',
          description: 'Új funkciók hamarabb, kisebb stabilitással.',
          version: 'Nincs aktív előzetes teszt',
          releaseUrl: currentTrack.releaseUrl,
          disabled: true,
        },
  ];
  const cards = cardModels
    .map((track) => {
      const disabled = track.disabled === true;
      const selected = track.id === selectedDownloadTrack;
      return `
        <button
          type="button"
          class="track-card${selected ? ' selected' : ''}${disabled ? ' disabled' : ''}"
          data-track-id="${track.id}"
          ${disabled ? 'disabled' : ''}
        >
          <span class="track-card-title">${track.title}</span>
          <span class="track-card-description">${track.description}</span>
          <span class="track-card-version">${track.version}</span>
        </button>
      `;
    })
    .join('');

  return `
    <div class="track-toggle-block">
      <div class="track-toggle-header">
        <span class="track-toggle-title">Kiadási csatorna</span>
        <a class="track-release-link" href="${currentTrack.releaseUrl}" target="_blank" rel="noreferrer">Kiadási oldal</a>
      </div>
      <div class="track-toggle-grid">${cards}</div>
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

function buildPlatformRows(track) {
  return Object.entries(track.platforms)
    .map(([platformId, platform]) => {
      const storeOptions = platform.storeOptions ?? [];
      const downloadOptions = platform.downloadOptions ?? [];
      const hasAnyOption = storeOptions.length > 0 || downloadOptions.length > 0;

      const optionMarkup = [
        ...storeOptions.map(
          (option) => `
            <a class="download-option primary" href="${option.url}" target="_blank" rel="noreferrer">
              <span class="material-icons">storefront</span>
              <span class="download-option-copy">
                <span class="download-option-title">${option.name}</span>
                <span class="download-option-subtitle">Áruház</span>
              </span>
            </a>
          `,
        ),
        ...downloadOptions.map(
          (option) => `
            <a class="download-option" href="${option.url}" target="_blank" rel="noreferrer">
              <span class="material-icons">download</span>
              <span class="download-option-copy">
                <span class="download-option-title">${option.name}</span>
                <span class="download-option-tags">
                  ${option.statsLabel ? `<span class="download-tag">${option.statsLabel}</span>` : ''}
                  ${option.sizeLabel ? `<span class="download-tag">${option.sizeLabel}</span>` : ''}
                </span>
              </span>
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
            <div class="platform-name">${platform.name}</div>
            <div class="download-type">${
              hasAnyOption ? `Legfrissebb ${track.version}` : 'Hamarosan'
            }</div>
          </div>
          <div class="download-options">${hasAnyOption ? optionMarkup : ''}</div>
        </div>
      `;
    })
    .join('');
}

function renderDownloadPanel(containerId, includeCancel = false) {
  const containerElement = document.getElementById(containerId);
  if (!containerElement) {
    return;
  }

  const track = getAvailableTrack(selectedDownloadTrack);
  const rows = track ? buildPlatformRows(track) : formatEmptyState();

  containerElement.innerHTML = `
    ${createTrackToggleMarkup()}
    <div class="download-rows">${rows || formatEmptyState()}</div>
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

  containerElement.querySelectorAll('[data-track-id]').forEach((button) => {
    button.addEventListener('click', () => {
      setSelectedDownloadTrack(button.getAttribute('data-track-id'));
      renderDownloadPanel(containerId, includeCancel);
      if (typeof updateDownloadButton === 'function') {
        updateDownloadButton();
      }
    });
  });
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
  document.getElementById('storeDialog').classList.remove('show');
}
