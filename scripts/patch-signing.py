#!/usr/bin/env python3
"""Patch android/app/build.gradle to use release signing after expo prebuild."""

import sys

BUILD_GRADLE = "android/app/build.gradle"

with open(BUILD_GRADLE, "r", newline="") as f:
    content = f.read()

lines = content.split("\n")
new_lines = []

i = 0
while i < len(lines):
    line = lines[i]

    # After "keyPassword 'android'" + "}" + "}", insert release signingConfig
    if line.strip() == "keyPassword 'android'":
        new_lines.append(line)
        i += 1
        # This should be "        }" (close debug block)
        new_lines.append(lines[i])
        i += 1
        # This should be "    }" (close signingConfigs block)
        # Insert release config BEFORE this closing brace
        new_lines.append("        release {")
        new_lines.append("            if (project.hasProperty('CAMORENT_UPLOAD_STORE_FILE')) {")
        new_lines.append("                storeFile file(CAMORENT_UPLOAD_STORE_FILE)")
        new_lines.append("                storePassword CAMORENT_UPLOAD_STORE_PASSWORD")
        new_lines.append("                keyAlias CAMORENT_UPLOAD_KEY_ALIAS")
        new_lines.append("                keyPassword CAMORENT_UPLOAD_KEY_PASSWORD")
        new_lines.append("            }")
        new_lines.append("        }")
        new_lines.append(lines[i])  # "    }" closing signingConfigs
        i += 1
        continue

    # Replace "signingConfig signingConfigs.debug" in the release buildType
    # The pattern is: "// Caution!" comment followed by signingConfigs.debug
    if "Caution! In production" in line:
        # Skip this comment line
        i += 1
        # Skip the "// see https://..." line
        i += 1
        # Next line should be "signingConfig signingConfigs.debug"
        if i < len(lines) and "signingConfig signingConfigs.debug" in lines[i]:
            new_lines.append("            signingConfig signingConfigs.release")
            i += 1
            continue
        continue

    new_lines.append(line)
    i += 1

result = "\n".join(new_lines)

with open(BUILD_GRADLE, "w", newline="") as f:
    f.write(result)

# Verify
if "signingConfigs.release" in result and "CAMORENT_UPLOAD_STORE_FILE" in result:
    print("OK: build.gradle patched for release signing")
    for ln in new_lines:
        if "signingConfig " in ln:
            print(f"  {ln.strip()}")
else:
    print("ERROR: Patch failed!", file=sys.stderr)
    sys.exit(1)
