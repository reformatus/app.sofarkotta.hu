// Import shared configuration and common functions
// Note: Using script tags in the HTML file to load shared-config.js and common.js before this file

function updateDownloadButton() {
    const platformId = detectPlatform();
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadText = document.getElementById('downloadText');
    const downloadBtnContainer = document.getElementById('downloadBtnContainer');

    // Add smooth transition for text change
    downloadBtn.style.opacity = '0.7';
    
    setTimeout(() => {
        try {
            const preferred = platformId ? getPreferredPlatformOption(platformId) : null;

            if (platformId && preferred && preferred.emphasis !== 'none') {
                downloadText.textContent = preferred.name;
                downloadBtn.href = preferred.url;
                downloadBtn.onclick = null;

                downloadBtnContainer.classList.add('platform-detected');
                downloadBtnContainer.classList.toggle('beta-button', preferred.track.id === 'prerelease');
            } else {
                downloadBtn.href = '#';
                downloadText.textContent = 'Alkalmazás letöltése';
                downloadBtn.onclick = function(e) {
                    e.preventDefault();
                    showStoreDialog();
                };
                
                downloadBtnContainer.classList.remove('platform-detected');
                downloadBtnContainer.classList.remove('beta-button');
            }
        } catch (error) {
            console.error("Error updating download button:", error);
            downloadBtn.href = '#';
            downloadText.textContent = 'Alkalmazás letöltése';
            downloadBtn.onclick = function(e) {
                e.preventDefault();
                showStoreDialog();
            };
            
            downloadBtnContainer.classList.remove('platform-detected');
            downloadBtnContainer.classList.remove('beta-button');
        }
          // Restore opacity
        downloadBtn.style.opacity = '1';
    }, 100);
}

// Close dialog when clicking outside
document.getElementById('storeDialog').addEventListener('click', function(e) {
    if (e.target === this) {
        closeDialog();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateDownloadButton();
    parseLinkAndUpdateUI();
    setupButtonHandlers();
});

function parseLinkAndUpdateUI() {
    // First check if we have an original path stored from the 404 redirect
    const originalPath = sessionStorage.getItem('originalPath');
    let pathname, search, hash;
    
    if (originalPath) {
        // Use the original path that was redirected from 404
        const url = new URL(window.location.origin + originalPath);
        pathname = url.pathname;
        search = url.search;
        hash = url.hash;
        
        // Clear the stored path so it doesn't interfere with future navigation
        sessionStorage.removeItem('originalPath');
        
        console.log('Using original path from redirect:', originalPath);
    } else {
        // Use the current URL
        const currentUrl = window.location.href;
        const url = new URL(currentUrl);
        pathname = url.pathname;
        search = url.search;
        hash = url.hash;
    }
    
    // Extract path after /launch/
    const launchMatch = pathname.match(/\/launch\/?(.*)/);
    if (!launchMatch || !launchMatch[1]) {
        // No extra path, keep default description
        return;
    }
    
    const launchPath = launchMatch[1];
    const fullParams = launchPath + search + hash;
    
    // Store the launch parameters for button handlers
    window.launchParams = fullParams;
    window.launchPath = launchPath;
    window.launchSearch = search;
    window.launchHash = hash;
    
    updateDescriptionForPath(launchPath, search);
}

function updateDescriptionForPath(path, search) {
    const descriptionEl = document.getElementById('linkDescription');
    
    // Add smooth transition for description change
    descriptionEl.style.opacity = '0.7';
    
    setTimeout(() => {
        // Handle specific cases
        if (path.startsWith('song/')) {
            const songId = path.replace('song/', '');
            descriptionEl.innerHTML = `Egy dal linkjét nyitottad meg.<br><strong>Dal ID: ${songId}</strong>`;
        } else if (path === 'cueJson' && search) {
            handleCueJsonLink(search, descriptionEl);
        } else {
            // Generic case
            descriptionEl.innerHTML = `Linket nyitottál meg:<br><strong>/${path}</strong>`;
        }
        
        // Restore opacity
        descriptionEl.style.opacity = '1';
    }, 100);
}

function handleCueJsonLink(search, descriptionEl) {
    try {
        const params = new URLSearchParams(search);
        const jsonData = params.get('data');
        
        if (jsonData) {
            const cueData = JSON.parse(decodeURIComponent(jsonData));
            const title = cueData.title || 'Névtelen';
            const description = cueData.description || '';
            const slideCount = cueData.content ? cueData.content.length : 0;
            
            let html = `Listaimportáló linket nyitottál meg:<br><strong>${title}</strong>`;
            if (description) {
                html += `<br><em>${description}</em>`;
            }
            html += `<br>Diák száma: ${slideCount}`;
            
            descriptionEl.innerHTML = html;
        } else {
            descriptionEl.innerHTML = 'Listaimportáló linket nyitottál meg.';
        }
    } catch (error) {
        console.error('Error parsing cue JSON:', error);
        descriptionEl.innerHTML = 'Listaimportáló linket nyitottál meg.';
    }
    
    // Restore opacity (called from updateDescriptionForPath)
    descriptionEl.style.opacity = '1';
}

function setupButtonHandlers() {
    const webAppBtn = document.getElementById('webAppBtn');
    const openInAppBtn = document.getElementById('openInAppBtn');
    
    webAppBtn.addEventListener('click', function() {
        const webUrl = new URL(getWebAppUrl());
        const webPath = `${webUrl.pathname}${webUrl.search}${webUrl.hash}`;

        if (webUrl.origin === window.location.origin && webUrl.pathname.startsWith('/web/')) {
            sessionStorage.setItem('originalWebPath', webPath);
            window.location.href = `${window.location.origin}/web/`;
            return;
        }

        window.location.href = webUrl.toString();
    });
    
    openInAppBtn.addEventListener('click', function() {
        const params = window.launchParams || '';
        const customSchemeUrl = `lyric:launch/${params}`;
        
        // Try to open custom scheme
        window.location.href = customSchemeUrl;
        
        // Fallback: if custom scheme doesn't work, could show a message
        // But since this is the last resort button, we'll just try the scheme
    });
}

function getWebAppUrl() {
    const launchPath = window.launchPath || '';
    const search = window.launchSearch || '';
    const hash = window.launchHash || '';
    const webPath = launchPath.startsWith('song/')
        ? launchPath
        : launchPath
            ? `launch/${launchPath}`
            : '';

    return `${window.location.origin}/web/${webPath}${search}${hash}`;
}
