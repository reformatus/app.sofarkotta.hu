window.sofarSharedConfig = {
  downloads: {
    defaultTrack: 'stable',
    tracks: {
      stable: {
        id: 'stable',
        title: 'Stabil kiadás',
        description: 'Ajánlott a legtöbb felhasználónak.',
        version: '1.0.2+102',
        releaseUrl:
          'https://github.com/reformatus/sofarhangolo/releases/tag/1.0.2%2B102',
        platforms: {
          android: {
            name: 'Android',
            icon: 'android',
            storeOptions: [
              {
                url: 'https://play.google.com/store/apps/details?id=org.lyricapp.sofar',
                name: 'Google Play',
              },
            ],
            downloadOptions: [
              {
                url: 'https://github.com/reformatus/sofarhangolo/releases/download/1.0.2%2B102/app-release-universal.102.apk',
                name: 'APK',
                statsLabel: '7 letöltés',
                sizeLabel: '85.2 MB',
              },
            ],
          },
          ios: {
            name: 'iOS',
            icon: 'phone_iphone',
            storeOptions: [
              {
                url: 'https://apps.apple.com/us/app/s%C3%B3f%C3%A1r-hangol%C3%B3/id6738664835',
                name: 'App Store',
              },
            ],
            downloadOptions: [],
          },
          windows: {
            name: 'Windows',
            icon: 'desktop_windows',
            storeOptions: [],
            downloadOptions: [],
          },
          macos: {
            name: 'macOS',
            icon: 'laptop_mac',
            storeOptions: [],
            downloadOptions: [],
          },
          linux: {
            name: 'Linux',
            icon: 'terminal',
            storeOptions: [],
            downloadOptions: [],
          },
        },
      },
      prerelease: {
        id: 'prerelease',
        title: 'Előzetes kiadás',
        description: 'Új funkciók hamarabb, kisebb stabilitással.',
        version: '1.1.1+111',
        releaseUrl:
          'https://github.com/reformatus/sofarhangolo/releases/tag/1.1.1%2B111',
        platforms: {
          android: {
            name: 'Android',
            icon: 'android',
            storeOptions: [
              {
                url: 'https://play.google.com/apps/testing/org.lyricapp.sofar',
                name: 'Google Play Beta',
              },
            ],
            downloadOptions: [],
          },
          ios: {
            name: 'iOS',
            icon: 'phone_iphone',
            storeOptions: [
              {
                url: 'https://testflight.apple.com/join/EsV5pBEN',
                name: 'TestFlight',
              },
            ],
            downloadOptions: [],
          },
          windows: {
            name: 'Windows',
            icon: 'desktop_windows',
            storeOptions: [],
            downloadOptions: [
              {
                url: 'https://github.com/reformatus/sofarhangolo/releases/download/1.1.1%2B111/sofar-hangolo-1.1.1-windows-x64-setup.exe',
                name: 'Telepítő',
                statsLabel: '0 letöltés',
                sizeLabel: '16.7 MB',
              },
              {
                url: 'https://github.com/reformatus/sofarhangolo/releases/download/1.1.1%2B111/sofar-hangolo-1.1.1-windows-store.msix',
                name: 'MSIX csomag',
                statsLabel: '0 letöltés',
                sizeLabel: '22.0 MB',
              },
            ],
          },
          macos: {
            name: 'macOS',
            icon: 'laptop_mac',
            storeOptions: [],
            downloadOptions: [
              {
                url: 'https://github.com/reformatus/sofarhangolo/releases/download/1.1.1%2B111/Sofar-Hangolo-1.1.1-macos.dmg',
                name: 'DMG',
                statsLabel: '1 letöltés',
                sizeLabel: '35.8 MB',
              },
            ],
          },
          linux: {
            name: 'Linux',
            icon: 'terminal',
            storeOptions: [],
            downloadOptions: [
              {
                url: 'https://github.com/reformatus/sofarhangolo/releases/download/1.1.1%2B111/sofar-hangolo-1.1.1-linux-x86_64.flatpak',
                name: 'Flatpak',
                statsLabel: '0 letöltés',
                sizeLabel: '12.6 MB',
              },
            ],
          },
        },
      },
    },
  },
};
