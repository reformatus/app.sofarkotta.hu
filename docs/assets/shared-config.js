/**
 * Shared configuration for Sófár Hangoló platform availability and download options
 * Used by both main page and launch page
 */

// Platform configuration
const platformConfig = {
    android: {
        name: 'Android',
        icon: 'android',
        store: {
            url: 'https://play.google.com/store/apps/details?id=org.lyricapp.sofar',
            name: 'Google Play',
            available: true
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
    ios: {
        name: 'iOS',
        icon: 'phone_iphone',
        store: {
            url: 'https://apps.apple.com/us/app/s%C3%B3f%C3%A1r-hangol%C3%B3/id6738664835',
            name: 'App Store',
            available: true
        },
        package: {
            url: '#',
            name: 'IPA',
            available: false
        },
        beta: {
            url: 'https://testflight.apple.com/join/EsV5pBEN',
            name: 'TestFlight Beta',
            available: true
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