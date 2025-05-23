/**
 * Common functionality shared between main page and launch page
 * for displaying platform-specific download options
 */

// Platform detection based on user agent
function detectPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    console.log('User Agent:', userAgent);
    console.log('Platform:', platform);
    console.log('Touch Points:', navigator.maxTouchPoints);

    try {
        // iOS detection - includes iPad on newer iOS that reports as MacOS
        if (/iphone|ipad|ipod/.test(userAgent) || 
            (/safari/.test(userAgent) && /apple computer/.test(userAgent) && navigator.maxTouchPoints > 1)) {
            console.log('Detected: iOS');
            return 'ios';
        }

        // Android detection
        if (/android/.test(userAgent)) {
            console.log('Detected: Android');
            return 'android';
        }

        // macOS detection (desktop)
        if ((/mac/.test(platform) || /apple computer/.test(userAgent)) && 
            !(/iphone|ipad|ipod/.test(userAgent)) && 
            (navigator.maxTouchPoints === 0 || navigator.maxTouchPoints === undefined)) {
            console.log('Detected: macOS');
            return 'macos';
        }

        // Windows detection - enhanced to catch more Windows variants
        if (/win/.test(platform) || /windows nt/.test(userAgent) || /windows/.test(userAgent)) {
            console.log('Detected: Windows');
            return 'windows';
        }

        // Linux detection
        if (/linux/.test(platform) || /linux/.test(userAgent)) {
            console.log('Detected: Linux');
            return 'linux';
        }
    } catch (error) {
        console.error('Error during platform detection:', error);
    }

    // Fallback to simple OS checks if the above failed
    if (navigator.userAgent.indexOf('Windows') !== -1) return 'windows';
    if (navigator.userAgent.indexOf('Mac') !== -1) return 'macos';
    if (navigator.userAgent.indexOf('Linux') !== -1) return 'linux';
    if (navigator.userAgent.indexOf('Android') !== -1) return 'android';
    if (navigator.userAgent.indexOf('iPhone') !== -1 || 
        navigator.userAgent.indexOf('iPad') !== -1 || 
        navigator.userAgent.indexOf('iPod') !== -1) return 'ios';

    // Final check for Windows using CSSStyleDeclaration.getPropertyValue if available
    try {
        if (typeof getComputedStyle === 'function' && 
            getComputedStyle(document.documentElement).getPropertyValue('--ms-overflow-style') !== '') {
            console.log('Detected: Windows (via CSS property check)');
            return 'windows';
        }
    } catch (error) {
        console.error('Error during CSS property check:', error);
    }

    // Unknown platform
    console.log('Detected: Unknown platform');
    return null;
}

// Generate download rows for platforms in the container element
function generateDownloadRows(containerId, includeCancel = false) {
    const containerElement = document.getElementById(containerId);
    if (!containerElement) return;
    
    // Clear existing content
    containerElement.innerHTML = '';
      // Add platform options
    Object.keys(platformConfig).forEach(platformId => {
        const platform = platformConfig[platformId];
        
        // Check any download option is available
        const hasAnyDownload = platform.store.available || 
                              platform.package.available || 
                              platform.beta.available;
        
        // Create download row for each platform
        const downloadRow = document.createElement('div');
        downloadRow.className = 'download-row';
        if (!hasAnyDownload) {
            downloadRow.classList.add('disabled');
        }
          // Platform icon and info
        downloadRow.innerHTML = `
            <div class="platform-icon">
                <span class="material-icons">${platform.icon}</span>
            </div>
            <div class="download-info">
                <div class="platform-name">${platform.name}</div>
                ${!hasAnyDownload ? '<div class="download-type">Hamarosan</div>' : ''}
            </div>            <div class="download-options">
                ${platform.store.available ? 
                    `<button class="download-option primary" onclick="downloadFromStore('${platformId}', 'store')">
                        <span class="material-icons">download</span>${platform.store.name}
                    </button>` : ''}
                ${platform.package.available && platform.package.url ? 
                    `<button class="download-option" onclick="downloadFromStore('${platformId}', 'package')">
                        <span class="material-icons">download</span>${platform.package.name}
                    </button>` : ''}
                ${platform.beta.available ? 
                    `<button class="download-option beta" onclick="downloadFromStore('${platformId}', 'beta')">
                        <span class="material-icons">science</span>${platform.beta.name}
                    </button>` : ''}
            </div>
        `;
        
        containerElement.appendChild(downloadRow);
    });
    
    // Add cancel button if requested (for dialogs)
    if (includeCancel) {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'store-btn cancel-btn';
        cancelBtn.onclick = function() {
            if (typeof closeDialog === 'function') {
                closeDialog();
            }
        };
        cancelBtn.innerHTML = '<span class="material-icons">close</span>Mégse';
        containerElement.appendChild(cancelBtn);
    }
}

// Handle the download button click for a specific platform
function downloadFromStore(platformId, type = 'store') {
    const platform = platformConfig[platformId];
    
    if (type === 'store' && platform.store.available) {
        window.open(platform.store.url, '_blank');
    } else if (type === 'package' && platform.package.available) {
        window.open(platform.package.url, '_blank');
    } else if (type === 'beta' && platform.beta.available) {
        window.open(platform.beta.url, '_blank');
    } else {
        alert('Ez a verzió még nem érhető el. Hamarosan!');
    }
    
    // Close dialog if it exists and is open
    if (typeof closeDialog === 'function') {
        closeDialog();
    }
}
