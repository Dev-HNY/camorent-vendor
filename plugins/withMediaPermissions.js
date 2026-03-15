const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Adds Android media permissions with correct maxSdkVersion attributes:
 * - READ_MEDIA_IMAGES (API 33+, maxSdkVersion=32 for older Android)
 * - READ_MEDIA_VISUAL_USER_SELECTED (API 34+ partial photo picker)
 *
 * This satisfies Google Play policy while keeping gallery working on all Android versions.
 */
module.exports = function withMediaPermissions(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    const permissions = manifest['uses-permission'];

    const hasReadMedia = permissions.some(
      (p) => p.$?.['android:name'] === 'android.permission.READ_MEDIA_IMAGES'
    );
    if (!hasReadMedia) {
      permissions.push({
        $: {
          'android:name': 'android.permission.READ_MEDIA_IMAGES',
          'android:maxSdkVersion': '32',
        },
      });
    }

    const hasVisualSelected = permissions.some(
      (p) => p.$?.['android:name'] === 'android.permission.READ_MEDIA_VISUAL_USER_SELECTED'
    );
    if (!hasVisualSelected) {
      permissions.push({
        $: {
          'android:name': 'android.permission.READ_MEDIA_VISUAL_USER_SELECTED',
        },
      });
    }

    return config;
  });
};
