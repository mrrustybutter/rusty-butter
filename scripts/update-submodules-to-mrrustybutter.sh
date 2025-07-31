#!/bin/bash

# Script to update submodule URLs to mrrustybutter forks

echo "Updating submodule URLs to mrrustybutter repositories..."

# Update .gitmodules file
sed -i 's/CodingButter/mrrustybutter/g' .gitmodules
sed -i 's/codingbutter/mrrustybutter/g' .gitmodules

# Sync the changes to git config
git submodule sync

# Update each submodule's origin
echo "Updating ABIDE..."
cd packages/ABIDE
git remote set-url origin https://github.com/mrrustybutter/ABIDE.git
cd ../..

echo "Updating elevenlabs-streaming..."
cd packages/elevenlabs-streaming
git remote set-url origin https://github.com/mrrustybutter/elevenlabs-streaming.git
cd ../..

echo "Updating pump-chat..."
cd packages/pump-chat
git remote set-url origin https://github.com/mrrustybutter/pump-chat.git
cd ../..

echo "Updating rustybutter-avatar..."
cd packages/rustybutter-avatar
git remote set-url origin https://github.com/mrrustybutter/rustybutter-avatar.git
cd ../..

echo "Updating semantic-memory..."
cd packages/semantic-memory
git remote set-url origin https://github.com/mrrustybutter/semantic-memory.git
cd ../..

echo "Done! Submodule URLs have been updated."
echo ""
echo "To complete the process:"
echo "1. Fork these repositories on GitHub to mrrustybutter account:"
echo "   - https://github.com/CodingButter/ABIDE"
echo "   - https://github.com/CodingButter/elevenlabs-streaming"
echo "   - https://github.com/CodingButter/pump-chat"
echo "   - https://github.com/CodingButter/rustybutter-avatar"
echo "   - https://github.com/CodingButter/semantic-memory"
echo ""
echo "2. Then commit the changes:"
echo "   git add .gitmodules"
echo "   git commit -m 'Update submodule URLs to mrrustybutter forks'"
echo ""
echo "3. Push to your repository:"
echo "   git push"