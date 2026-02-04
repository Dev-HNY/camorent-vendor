# 🚀 Deployment Checklist for Google Play Store

## ✅ Pre-Deployment Checklist

### 1. App Configuration
- [x] Production API configured (`https://api.camorent.co.in`)
- [ ] App version updated in `app.json` (increment for each release)
- [ ] Version code incremented in `app.json`
- [ ] App icons and splash screen finalized
- [ ] App name and description verified

### 2. Signing Setup (One-time)
- [ ] Generate release keystore (see [SIGNING_SETUP.md](./SIGNING_SETUP.md))
- [ ] Add GitHub Secrets:
  - [ ] `KEYSTORE_BASE64`
  - [ ] `KEYSTORE_PASSWORD`
  - [ ] `KEY_ALIAS`
  - [ ] `KEY_PASSWORD`
- [ ] Test local release build
- [ ] Backup keystore to secure location

### 3. Testing
- [ ] Test on physical Android device
- [ ] Test all critical user flows
- [ ] Test payment/settlement flows
- [ ] Test image uploads (pickup/return/challan)
- [ ] Test approve/reject functionality
- [ ] Verify no console errors
- [ ] Check Android navigation overlaps fixed

### 4. Build & Upload
- [ ] Push to main branch (triggers automated build)
- [ ] Download AAB from GitHub Actions artifacts
- [ ] Upload to Google Play Console (Internal Testing first)
- [ ] Test internal release
- [ ] Promote to Production

---

## 📋 Step-by-Step Deployment

### Step 1: Update Version
Edit `app.json`:
```json
{
  "version": "1.0.1",
  "android": {
    "versionCode": 2
  }
}
```

### Step 2: Generate Keystore (First time only)
```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore android/app/camorent-upload-key.keystore \
  -alias camorent-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000
```

### Step 3: Add GitHub Secrets

1. **Encode keystore:**
   ```bash
   base64 -i android/app/camorent-upload-key.keystore | tr -d '\n' > keystore.txt
   ```

2. **Add to GitHub:**
   - Go to: Settings → Secrets and variables → Actions
   - Add all 4 secrets (see above)

### Step 4: Push & Build
```bash
git add .
git commit -m "Release v1.0.1"
git push origin main
```

### Step 5: Download Artifacts
1. Go to GitHub Actions tab
2. Wait for build to complete (~15 minutes)
3. Download `app-release-aab` artifact
4. Extract the `.aab` file

### Step 6: Upload to Play Store
1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. **Release → Testing → Internal testing**
4. Create new release → Upload AAB
5. Add release notes
6. Roll out to internal testers

### Step 7: Test & Promote
1. Install from internal testing
2. Test thoroughly
3. If all good: **Release → Production**
4. Create production release with same AAB
5. Submit for review

---

## 🔄 For Subsequent Releases

1. ✅ Increment version in `app.json`
2. ✅ Push to main branch
3. ✅ Download AAB from Actions
4. ✅ Upload to Play Console
5. ✅ Submit for review

---

## 📱 Build Outputs

### Local Build
- **APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **AAB**: `android/app/build/outputs/bundle/release/app-release.aab`

### GitHub Actions
- **APK**: Download `app-release-apk` artifact
- **AAB**: Download `app-release-aab` artifact

---

## ⚠️ Important Notes

- **AAB is required** for Play Store (not APK)
- **APK is for testing** only (can be installed directly on device)
- **Never commit** keystore or passwords to git
- **Always backup** keystore in secure location
- **Increment version** for every release

---

## 🆘 Common Issues

### Build fails with "Keystore not found"
→ Add GitHub Secrets (see Step 3)

### "App not signed correctly"
→ Verify keystore password in GitHub Secrets

### "Version code must be greater than X"
→ Increment versionCode in app.json

### Internal testing not showing app
→ Wait 1-2 hours for Play Store processing
→ Check email invitations for testers

---

## 📚 Resources

- [SIGNING_SETUP.md](./SIGNING_SETUP.md) - Detailed signing guide
- [Google Play Console](https://play.google.com/console)
- [GitHub Actions](./.github/workflows/build-aab.yml)
