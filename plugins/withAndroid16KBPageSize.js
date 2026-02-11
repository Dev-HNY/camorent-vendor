const { withAppBuildGradle, withAndroidManifest, withGradleProperties } = require('@expo/config-plugins');

module.exports = function withAndroid16KBPageSize(config) {
  // Add manifest property for 16KB page size support
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;

    // Add property to application tag for 16KB page size support
    if (androidManifest.application && androidManifest.application[0]) {
      const app = androidManifest.application[0];

      // Initialize property array if it doesn't exist
      if (!app.property) {
        app.property = [];
      }

      // Check if the property already exists
      const propertyExists = app.property.some(
        prop => prop.$?.['android:name'] === 'android.app.16kb_page_size'
      );

      if (!propertyExists) {
        // Add the 16KB page size support property
        app.property.push({
          $: {
            'android:name': 'android.app.16kb_page_size',
            'android:value': 'true'
          }
        });
      }
    }

    return config;
  });

  // Add gradle.properties configuration
  config = withGradleProperties(config, (config) => {
    const properties = config.modResults;

    // Ensure useLegacyPackaging is false
    const legacyPackagingIndex = properties.findIndex(
      item => item.type === 'property' && item.key === 'expo.useLegacyPackaging'
    );

    if (legacyPackagingIndex >= 0) {
      properties[legacyPackagingIndex].value = 'false';
    } else {
      properties.push({
        type: 'property',
        key: 'expo.useLegacyPackaging',
        value: 'false',
      });
    }

    // Add support for 16KB pages in Gradle
    const supports16KBIndex = properties.findIndex(
      item => item.type === 'property' && item.key === 'android.bundle.enableUncompressedNativeLibs'
    );

    if (supports16KBIndex >= 0) {
      properties[supports16KBIndex].value = 'true';
    } else {
      properties.push({
        type: 'property',
        key: 'android.bundle.enableUncompressedNativeLibs',
        value: 'true',
      });
    }

    return config;
  });

  // Configure packaging options for 16KB support
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let buildGradle = config.modResults.contents;

      // Check if already configured
      if (buildGradle.includes('useLegacyPackaging')) {
        return config;
      }

      // Find the existing packagingOptions block and modify it
      const packagingOptionsRegex = /packagingOptions\s*\{([^}]*)\}/s;

      if (packagingOptionsRegex.test(buildGradle)) {
        // Modify existing packagingOptions
        buildGradle = buildGradle.replace(
          packagingOptionsRegex,
          (match, content) => {
            if (content.includes('jniLibs')) {
              // Already has jniLibs, ensure useLegacyPackaging is false
              return match.replace(
                /(jniLibs\s*\{)/,
                '$1\n            useLegacyPackaging false\n'
              );
            } else {
              // Add jniLibs block with useLegacyPackaging false
              return match.replace(
                /packagingOptions\s*\{/,
                `packagingOptions {\n        jniLibs {\n            useLegacyPackaging false\n        }`
              );
            }
          }
        );
      } else {
        // No packagingOptions, add it before buildTypes
        const packagingBlock = `
    packagingOptions {
        jniLibs {
            useLegacyPackaging false
        }
    }
`;
        buildGradle = buildGradle.replace(
          /(\s+buildTypes\s*\{)/,
          `${packagingBlock}\n$1`
        );
      }

      config.modResults.contents = buildGradle;
    }
    return config;
  });

  return config;
};
