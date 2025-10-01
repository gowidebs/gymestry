#!/bin/bash

# 🚀 Gymestry Deployment Script

echo "🏋️ Gymestry Deployment Script"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Error: Please run this script from the Gymestry project root directory"
    exit 1
fi

# Add all changes
echo "📝 Adding changes..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "✅ No changes to commit"
else
    # Commit changes
    echo "💾 Committing changes..."
    git commit -m "🚀 Deploy: Update Gymestry gym management system - $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
echo ""
echo "⚠️  Authentication Required:"
echo "   If prompted, use your GitHub username and Personal Access Token"
echo "   (Not your regular password - create a token at: https://github.com/settings/tokens)"
echo ""

# Try to push
if git push origin main; then
    echo ""
    echo "🎉 SUCCESS! Your code has been pushed to GitHub!"
    echo ""
    echo "🌐 Next Steps:"
    echo "1. Go to: https://github.com/gowidebs/gymestry"
    echo "2. Click 'Settings' tab"
    echo "3. Scroll to 'Pages' section"
    echo "4. Set Source to 'Deploy from a branch'"
    echo "5. Select 'main' branch and '/docs' folder"
    echo "6. Click 'Save'"
    echo ""
    echo "🎯 Your live site will be available at:"
    echo "   https://gowidebs.github.io/gymestry/"
    echo ""
    echo "⏱️  Note: It may take a few minutes for GitHub Pages to deploy"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "1. Your internet connection"
    echo "2. GitHub authentication (use Personal Access Token)"
    echo "3. Repository permissions"
    echo ""
    echo "💡 Alternative: Use GitHub CLI"
    echo "   brew install gh"
    echo "   gh auth login"
    echo "   git push origin main"
fi