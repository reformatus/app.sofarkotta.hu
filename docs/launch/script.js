// Import shared configuration and common functions
// Note: Using script tags in the HTML file to load shared-config.js and common.js before this file

function updateDownloadButton() {
    // Use the detectPlatform function from common.js
    const platformId = detectPlatform();
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadText = document.getElementById('downloadText');
    const downloadLabel = document.getElementById('downloadLabel');
    const downloadBtnContainer = document.getElementById('downloadBtnContainer');

    console.log("Detected platform for button:", platformId); // Debug message

    // Add smooth transition for text change
    downloadBtn.style.opacity = '0.7';
    
    setTimeout(() => {
        try {
            // Check if we have a valid platform and if there's an available download option
            if (platformId && platformConfig[platformId]) {
                const platform = platformConfig[platformId];
                console.log("Platform config:", platform);
                
                // Check download availability in this order: 1. Store, 2. Beta, 3. Package
                if (platform.store.available) {
                    // Official store is available
                    downloadLabel.textContent = `${platform.name} alkalmazás letöltése`;
                    downloadLabel.classList.add('visible');
                    
                    downloadText.innerHTML = `<strong>${platform.name} - ${platform.store.name}</strong>`;
                    downloadBtn.href = platform.store.url;
                    downloadBtn.onclick = null; // Remove click handler, use normal link behavior
                    
                    downloadBtnContainer.classList.add('platform-detected');
                    downloadBtnContainer.classList.remove('beta-button');
                } else if (platform.beta.available) {
                    // Beta is available
                    downloadLabel.textContent = `${platform.name} béta letöltése`;
                    downloadLabel.classList.add('visible');
                    
                    downloadText.innerHTML = `<strong>${platform.name} - ${platform.beta.name} (Béta)</strong>`;
                    downloadBtn.href = platform.beta.url;
                    downloadBtn.onclick = null; // Remove click handler, use normal link behavior
                    
                    downloadBtnContainer.classList.add('platform-detected');
                    downloadBtnContainer.classList.add('beta-button');
                } else if (platform.package.available) {
                    // Package download is available
                    downloadLabel.textContent = `${platform.name} alkalmazás letöltése`;
                    downloadLabel.classList.add('visible');
                    
                    downloadText.innerHTML = `<strong>${platform.name} - ${platform.package.name}</strong>`;
                    downloadBtn.href = platform.package.url;
                    downloadBtn.onclick = null; // Remove click handler, use normal link behavior
                    
                    downloadBtnContainer.classList.add('platform-detected');
                    downloadBtnContainer.classList.remove('beta-button');
                } else {
                    // Nothing is available for this platform yet
                    downloadLabel.classList.remove('visible');
                    
                    downloadBtn.href = '#';
                    downloadText.textContent = `${platform.name} verzió hamarosan`;
                    downloadBtn.onclick = function(e) {
                        e.preventDefault();
                        showStoreDialog();
                    };
                    
                    downloadBtnContainer.classList.remove('platform-detected');
                    downloadBtnContainer.classList.remove('beta-button');
                }
            } else {
                // Handle unknown platform
                downloadLabel.classList.remove('visible');
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
            // Fallback to default state
            downloadLabel.classList.remove('visible');
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

function showStoreDialog() {
    // Populate download options before showing the dialog
    generateDownloadRows('dialogDownloadOptions', true);
    document.getElementById('storeDialog').classList.add('show');
}

function closeDialog() {
    document.getElementById('storeDialog').classList.remove('show');
}

// Close dialog when clicking outside
document.getElementById('storeDialog').addEventListener('click', function(e) {
    if (e.target === this) {
        closeDialog();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Launch page initialized');
    console.log('Platform detection debugging - Available platforms:', Object.keys(platformConfig).join(', '));
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
            descriptionEl.innerHTML = `Megnyitottad egy dal linkjét:<br><strong>Dal ID: ${songId}</strong>`;
        } else if (path === 'cueJson' && search) {
            handleCueJsonLink(search, descriptionEl);
        } else {
            // Generic case
            descriptionEl.innerHTML = `Megnyitottad a következő linket:<br><strong>/${path}</strong>`;
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
            
            let html = `Megnyitottad egy dalszöveg-importálás linkjét:<br><strong>${title}</strong>`;
            if (description) {
                html += `<br><em>${description}</em>`;
            }
            html += `<br>Diák száma: ${slideCount}`;
            
            descriptionEl.innerHTML = html;
        } else {
            descriptionEl.innerHTML = 'Megnyitottad egy dalszöveg-importálás linkjét.';
        }
    } catch (error) {
        console.error('Error parsing cue JSON:', error);
        descriptionEl.innerHTML = 'Megnyitottad egy dalszöveg-importálás linkjét.';
    }
    
    // Restore opacity (called from updateDescriptionForPath)
    descriptionEl.style.opacity = '1';
}

function setupButtonHandlers() {
    const webAppBtn = document.getElementById('webAppBtn');
    const openInAppBtn = document.getElementById('openInAppBtn');
    
    webAppBtn.addEventListener('click', function() {
        const params = window.launchParams || '';
        const webAppUrl = `https://app.sofarkotta.hu/web/${params}`;
        window.open(webAppUrl, '_blank');
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
