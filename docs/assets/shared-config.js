/**
 * Shared configuration for Sófár DalApp platform availability and download options
 * Used by both main page and launch page
 */

// Platform configuration
const platformConfig = {
    // Mobile platforms
    ios: {
        name: 'iOS',
        icon: 'phone_iphone',
        store: {
            url: '#', // Coming soon
            name: 'App Store',
            available: false
        },
        package: {
            url: null, // iOS does not support direct package installation
            name: null,
            available: false
        },
        beta: {
            url: 'https://testflight.apple.com/join/EsV5pBEN',
            name: 'TestFlight Beta',
            available: true
        }
    },    android: {
        name: 'Android',
        icon: 'android',
        store: {
            url: '#', // Coming soon
            name: 'Google Play',
            available: false
        },
        package: {
            url: 'https://github.com/reformatus/lyric/releases/latest',
            name: 'APK',
            available: true
        },
        beta: {
            url: 'https://play.google.com/apps/testing/org.lyricapp.sofar',
            name: 'Google Play Beta',
            available: true
        }
    },
    
    // Desktop platforms
    macos: {
        name: 'macOS',
        icon: 'laptop_mac',
        store: {
            url: '#', // Coming soon
            name: 'Mac App Store',
            available: false
        },
        package: {
            url: '#', // Coming soon
            name: 'DMG File',
            available: false
        },
        beta: {
            url: '#', // Coming soon
            name: 'Mac Beta',
            available: false
        }
    },
    windows: {
        name: 'Windows',
        icon: 'desktop_windows',
        store: {
            url: '#', // Coming soon
            name: 'Microsoft Store',
            available: false
        },
        package: {
            url: '#', // Coming soon
            name: 'Installer',
            available: false
        },
        beta: {
            url: '#', // Coming soon
            name: 'Windows Beta',
            available: false
        }
    },
    linux: {
        name: 'Linux',
        icon: 'terminal',
        store: {
            url: '#', // Coming soon
            name: 'Linux Store',
            available: false
        },
        package: {
            url: '#', // Coming soon
            name: 'Package',
            available: false
        },
        beta: {
            url: '#', // Coming soon
            name: 'Linux Beta',
            available: false
        }
    }
};

// For backward compatibility with existing code
const storeUrls = {
    ios: platformConfig.ios.store.url,
    android: platformConfig.android.store.url,
    androidApk: platformConfig.android.package.url,
    macos: platformConfig.macos.store.url,
    windows: platformConfig.windows.store.url,
    linux: platformConfig.linux.store.url,
    // Beta URLs
    iosBeta: platformConfig.ios.beta.url,
    androidBeta: platformConfig.android.beta.url,
    macosBeta: platformConfig.macos.beta.url,
    windowsBeta: platformConfig.windows.beta.url,
    linuxBeta: platformConfig.linux.beta.url
};

const storeNames = {
    ios: platformConfig.ios.store.name,
    android: platformConfig.android.store.name,
    androidApk: platformConfig.android.package.name,
    macos: platformConfig.macos.store.name,
    windows: platformConfig.windows.store.name,
    linux: platformConfig.linux.store.name,
    // Beta names
    iosBeta: platformConfig.ios.beta.name,
    androidBeta: platformConfig.android.beta.name,
    macosBeta: platformConfig.macos.beta.name,
    windowsBeta: platformConfig.windows.beta.name,
    linuxBeta: platformConfig.linux.beta.name
};

const storeAvailability = {
    ios: platformConfig.ios.store.available,
    android: platformConfig.android.store.available,
    androidApk: platformConfig.android.package.available,
    macos: platformConfig.macos.store.available,
    windows: platformConfig.windows.store.available,
    linux: platformConfig.linux.store.available,
    // Beta availability
    iosBeta: platformConfig.ios.beta.available,
    androidBeta: platformConfig.android.beta.available,
    macosBeta: platformConfig.macos.beta.available,
    windowsBeta: platformConfig.windows.beta.available,
    linuxBeta: platformConfig.linux.beta.available
};
