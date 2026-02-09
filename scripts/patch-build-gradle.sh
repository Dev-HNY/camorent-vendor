#!/bin/bash
# Patch android/app/build.gradle to use release signing
# This runs AFTER expo prebuild which regenerates build.gradle with debug signing

BUILD_GRADLE="android/app/build.gradle"

if [ ! -f "$BUILD_GRADLE" ]; then
  echo "❌ build.gradle not found at $BUILD_GRADLE"
  exit 1
fi

echo "📝 Patching $BUILD_GRADLE for release signing..."

# Use Python for reliable multi-line text replacement
python3 << 'PYEOF'
import re

with open("android/app/build.gradle", "r") as f:
    content = f.read()

# 1. Add release signingConfig after debug signingConfig block
old_signing = '''    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }'''

new_signing = '''    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (project.hasProperty('CAMORENT_UPLOAD_STORE_FILE')) {
                storeFile file(CAMORENT_UPLOAD_STORE_FILE)
                storePassword CAMORENT_UPLOAD_STORE_PASSWORD
                keyAlias CAMORENT_UPLOAD_KEY_ALIAS
                keyPassword CAMORENT_UPLOAD_KEY_PASSWORD
            }
        }
    }'''

content = content.replace(old_signing, new_signing)

# 2. Change release buildType from debug to release signing
old_release = '''        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug'''

new_release = '''        release {
            signingConfig signingConfigs.release'''

content = content.replace(old_release, new_release)

with open("android/app/build.gradle", "w") as f:
    f.write(content)

print("✅ Python patch applied successfully")
PYEOF

echo ""
echo "--- Verification ---"
echo "signingConfigs:"
grep -A 15 "signingConfigs {" "$BUILD_GRADLE" | head -18
echo ""
echo "release buildType:"
grep -B 1 -A 6 "release {" "$BUILD_GRADLE" | grep -A 6 "buildTypes" | head -8
echo ""
echo "All signingConfig references:"
grep "signingConfig " "$BUILD_GRADLE"
echo "---"
