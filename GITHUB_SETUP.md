# GitHub Repository Setup Guide

## Setting Up a GitHub Repository

### 1. Create a GitHub Account

If you don't already have a GitHub account, create one at [github.com](https://github.com/signup).

### 2. Create a New Repository

1. Log in to your GitHub account
2. Click the '+' icon in the upper right corner and select 'New repository'
3. Name your repository (e.g., "water-leakage-detection-system")
4. Add a description (optional): "A full-stack application for real-time water flow monitoring and leak detection"
5. Choose 'Public' or 'Private' visibility
6. Check the box to initialize with a README
7. Click 'Create repository'

### 3. Upload the Project Files

#### Option 1: Using the GitHub Web Interface

1. In your new repository, click the 'Add file' dropdown and select 'Upload files'
2. Drag and drop or select the project files from your computer
3. Add a commit message describing the initial upload
4. Click 'Commit changes'

#### Option 2: Using Git from Command Line (Recommended)

1. Install Git on your local machine if you haven't already
2. Clone the empty repository to your local machine:

```bash
git clone https://github.com/YOUR_USERNAME/water-leakage-detection-system.git
cd water-leakage-detection-system
```

3. Copy all project files to this directory
4. Add, commit, and push the files:

```bash
git add .
git commit -m "Initial project upload"
git push -u origin main
```

### 4. Set Up GitHub Actions

The `.github/workflows/node.js.yml` file included in the project already contains the necessary CI workflow configuration. This will automatically run tests whenever changes are pushed to the repository.

## Accessing the Repository on Another Machine

### 1. Prerequisites

Ensure the following are installed on the machine:

- Git
- Node.js (v20.x or later)
- PostgreSQL (v14.x or later)

### 2. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/water-leakage-detection-system.git
cd water-leakage-detection-system
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/water_leak_db
SESSION_SECRET=your_session_secret_here
```

Replace `username`, `password`, and other values as appropriate for your PostgreSQL setup.

### 5. Set Up the Database

Follow the instructions in SETUP_GUIDE.md to create and configure your PostgreSQL database.

### 6. Initialize the Database Schema and Data

```bash
npm run db:push
npm run db:seed
```

### 7. Start the Application

```bash
npm run dev
```

### 8. Access the Application

Open your browser and navigate to `http://localhost:5000`

## Working with the Repository

### Pulling Updates

To get the latest changes from the repository:

```bash
git pull origin main
```

### Making Changes

1. Create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes to the code
3. Commit your changes:

```bash
git add .
git commit -m "Description of your changes"
```

4. Push your branch to GitHub:

```bash
git push -u origin feature/your-feature-name
```

5. Create a Pull Request on GitHub to merge your changes into the main branch

### Troubleshooting

#### Database Connection Issues

If you encounter database connection issues:

1. Verify PostgreSQL is running
2. Check that the database and user exist
3. Confirm the connection string in your `.env` file is correct

#### Node.js Compatibility

If you encounter Node.js compatibility issues:

1. Check your Node.js version with `node --version`
2. If needed, install Node.js v20 or later
3. You can use a version manager like nvm to manage multiple Node.js versions

## Additional GitHub Features

### Issue Tracking

Use GitHub Issues to track bugs, feature requests, and other tasks:

1. Navigate to the 'Issues' tab in your repository
2. Click 'New issue'
3. Provide a title and description
4. Assign to team members if desired
5. Add labels for categorization

### Releases

Create tagged releases for stable versions:

1. Navigate to the 'Releases' section
2. Click 'Create a new release'
3. Enter a tag version (e.g., v1.0.0)
4. Provide a title and description
5. Publish the release

### GitHub Pages (Optional)

If you want to create a project documentation site:

1. Go to repository Settings
2. Navigate to 'Pages'
3. Select your source branch and folder
4. Save to enable GitHub Pages
