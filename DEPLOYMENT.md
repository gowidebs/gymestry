# 🚀 Gymestry Deployment Guide

## GitHub Repository Setup

Your Gymestry project is ready for deployment! Here's how to get it live:

### 1. Push to GitHub

Since you're having authentication issues, here are the options:

#### Option A: Using Personal Access Token (Recommended)
1. Go to GitHub.com → Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` permissions
3. Use this command to push:
```bash
git push https://YOUR_TOKEN@github.com/gowidebs/gymestry.git main
```

#### Option B: Using GitHub CLI
```bash
# Install GitHub CLI if not installed
brew install gh

# Authenticate
gh auth login

# Push the code
git push origin main
```

### 2. Enable GitHub Pages

1. Go to your repository: https://github.com/gowidebs/gymestry
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **Deploy from a branch**
5. Choose **main** branch and **/ (root)** folder
6. Click **Save**

### 3. Configure GitHub Pages for docs/ folder

Since your web app is in the `docs/` folder:
1. In Pages settings, change the folder from **/ (root)** to **/docs**
2. Click **Save**
3. Your site will be available at: `https://gowidebs.github.io/gymestry/`

### 4. Custom Domain (Optional)

If you want to use a custom domain:
1. Add a `CNAME` file in the `docs/` folder with your domain
2. Configure your domain's DNS to point to GitHub Pages

## 🎯 Live Demo URL

Once deployed, your gym management system will be available at:
**https://gowidebs.github.io/gymestry/**

## 🔧 Local Development

To run locally:
```bash
# Navigate to project directory
cd Gymestry

# Serve the docs folder (you can use any local server)
python3 -m http.server 8000 --directory docs

# Or use Node.js
npx serve docs

# Or use PHP
php -S localhost:8000 -t docs
```

## 📱 Features Included

✅ Role-based authentication (Owner, Admin, Receptionist, Trainer)
✅ Member management system
✅ Financial reports and analytics
✅ Staff management
✅ Equipment tracking
✅ Class scheduling
✅ Payment processing
✅ Customer support system
✅ Progress tracking
✅ Responsive design
✅ Professional UI/UX

## 🔐 Demo Credentials

- **Owner**: owner@gym.com / admin123
- **Admin**: admin@gym.com / admin123
- **Receptionist**: reception@gym.com / admin123
- **Trainer**: trainer@gym.com / admin123

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js
- **Backend**: Node.js + Express (ready for deployment)
- **Database**: MongoDB/PostgreSQL ready
- **Deployment**: GitHub Pages

## 📞 Support

For any deployment issues, check:
1. Repository permissions
2. GitHub Pages settings
3. Branch protection rules
4. Custom domain configuration (if applicable)