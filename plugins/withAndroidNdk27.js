const { withAppBuildGradle, withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidNdk27(config) {
  // Set NDK version to 27 for 16KB page size support
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = config.modResults.contents.replace(
        /ndkVersion\s*=\s*"[^"]+"/,
        'ndkVersion = "27.0.12077973"'
      );
    }
    return config;
  });

  // Inject release signing config into app/build.gradle
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let buildGradle = config.modResults.contents;

      // Check if release signing config already exists
      if (buildGradle.includes('CAMORENT_UPLOAD_STORE_FILE')) {
        return config;
      }

      // Find the signingConfigs block and add release config
      const signingConfigsRegex = /(signingConfigs\s*\{[^}]*debug\s*\{[^}]*\})/;

      const releaseSigningConfig = `
        release {
            if (project.hasProperty('CAMORENT_UPLOAD_STORE_FILE')) {
                storeFile file(CAMORENT_UPLOAD_STORE_FILE)
                storePassword CAMORENT_UPLOAD_STORE_PASSWORD
                keyAlias CAMORENT_UPLOAD_KEY_ALIAS
                keyPassword CAMORENT_UPLOAD_KEY_PASSWORD
            }
        }`;

      buildGradle = buildGradle.replace(
        signingConfigsRegex,
        `$1${releaseSigningConfig}`
      );

      // Update release buildType to use release signing config
      buildGradle = buildGradle.replace(
        /release\s*\{[^}]*signingConfig\s+signingConfigs\.debug/,
        (match) => match.replace('signingConfigs.debug', 'signingConfigs.release')
      );

      config.modResults.contents = buildGradle;
    }
    return config;
  });

  return config;
};
