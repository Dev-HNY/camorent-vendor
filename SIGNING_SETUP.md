# Android App Signing Setup Guide

This guide explains how to set up app signing for Google Play Store deployment.

## 🔑 Step 1: Generate a Release Keystore

You need to generate a keystore file to sign your app for the Play Store.

### Generate Keystore Command:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore android/app/camorent-upload-key.keystore -alias camorent-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

When prompted, enter:
- **Keystore password**: Choose a strong password (remember this!)
- **Key password**: Choose a strong password (can be same as keystore password)
- **First and last name**: Your name or company name
- **Organizational unit**: Your department (optional)
- **Organization**: Camorent
- **City/Locality**: Your city
- **State/Province**: Your state
- **Country code**: IN (for India)

### Important Notes:
- ⚠️ **Keep your keystore file safe!** If you lose it, you cannot update your app on Play Store
- ⚠️ **Never commit the keystore file to git**
- ✅ Store the keystore and passwords in a secure location (password manager, secure backup)

---

## 📝 Step 2: Configure Local Signing

1. **Copy the example file:**
   ```bash
   cp android/gradle.properties.example android/gradle.properties
   ```

2. **Edit `android/gradle.properties`:**
   ```properties
   CAMORENT_UPLOAD_STORE_FILE=camorent-upload-key.keystore
   CAMORENT_UPLOAD_KEY_ALIAS=camorent-key-alias
   CAMORENT_UPLOAD_STORE_PASSWORD=your_actual_store_password
   CAMORENT_UPLOAD_KEY_PASSWORD=your_actual_key_password
   ```

3. **Move the keystore file:**
   ```bash
   # The keystore should be in android/app/ directory
   mv camorent-upload-key.keystore android/app/
   ```

---

## 🔄 Step 3: Configure GitHub Actions Signing

To build signed APK/AAB in GitHub Actions, you need to add secrets.

### A. Encode your keystore to base64:

**On Linux/Mac:**
```bash
base64 -i android/app/camorent-upload-key.keystore | tr -d '\n' > keystore.txt
```

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("android\app\camorent-upload-key.keystore")) > keystore.txt
```

### B. Add GitHub Secrets:

1. Go to your GitHub repository
2. Navigate to: **Settings → Secrets and variables → Actions**
3. Click **"New repository secret"** and add these secrets:

| Secret Name | Value |
|------------|-------|
| `KEYSTORE_BASE64` | Content of keystore.txt file |
| `KEYSTORE_PASSWORD` | Your keystore password |
| `KEY_ALIAS` | camorent-key-alias |
| `KEY_PASSWORD` | Your key password |

---

## 🚀 Step 4: Update GitHub Actions Workflow

The workflow will be updated to:
1. Decode the base64 keystore
2. Create gradle.properties with signing config
3. Build signed APK and AAB

---

## ✅ Step 5: Test Local Build

Test building a release APK locally:

```bash
cd android
./gradlew assembleRelease
```

The signed APK will be in:
`android/app/build/outputs/apk/release/app-release.apk`

---

## 📱 Step 6: Upload to Google Play Console

### First Upload (Internal Testing):
1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Navigate to: **Release → Testing → Internal testing**
4. Create a new release
5. Upload the AAB file: `android/app/build/outputs/bundle/release/app-release.aab`
6. Fill in release notes
7. Review and roll out to internal testing

### After Internal Testing Passes:
1. Navigate to: **Release → Production**
2. Create a new release
3. Upload the same AAB file
4. Submit for review

---

## 🔒 Security Best Practices

- ✅ **DO**: Keep keystore in a secure, backed-up location
- ✅ **DO**: Use strong, unique passwords
- ✅ **DO**: Store passwords in a password manager
- ✅ **DO**: Keep a backup of the keystore in multiple secure locations
- ❌ **DON'T**: Commit keystore or passwords to git
- ❌ **DON'T**: Share keystore or passwords in insecure channels
- ❌ **DON'T**: Use the same keystore for multiple apps

---

## 🆘 Troubleshooting

### Error: "Keystore was tampered with"
- Check that you're using the correct password
- Ensure the keystore file isn't corrupted

### Error: "release.keystore not found"
- Verify the keystore is in `android/app/` directory
- Check the path in gradle.properties

### Error: "KEYSTORE_BASE64 not found"
- Ensure you've added all required secrets to GitHub
- Check secret names match exactly (case-sensitive)

---

## 📚 Additional Resources

- [Android Developer: Sign your app](https://developer.android.com/studio/publish/app-signing)
- [Google Play Console: Upload your app](https://support.google.com/googleplay/android-developer/answer/9859152)
- [React Native: Publishing to Google Play Store](https://reactnative.dev/docs/signed-apk-android)
