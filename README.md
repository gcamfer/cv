# AI-Friendly CV and Portfolio

A modern, automated CV and portfolio website built with Python, YAML, and GitHub Pages.

## 🚀 Quick Start

```bash
# 1. View your CV locally
open docs/index.html

# 2. Edit your CV data
code data/cv.yaml

# 3. Validate and rebuild
uv run python scripts/validate_cv.py
uv run python scripts/build.py

# 4. View changes
open docs/index.html
```

## Features

- **AI-Friendly Data Format**: All CV data stored in YAML for easy parsing by AI agents and ML systems
- **Automatic Date Calculations**: Years of experience calculated dynamically from start dates
- **GitHub Actions Deployment**: Automatically builds and deploys on push
- **PDF Export**: Client-side PDF generation with always up-to-date information
- **Modern Design**: Tailwind CSS for a clean, professional look
- **Responsive**: Mobile-first design that looks great on all devices

## Structure

```
/
├── data/cv.yaml              # Your CV data (edit this!)
├── templates/                # Jinja2 HTML templates
├── scripts/                  # Python build scripts
├── static/                   # CSS and JavaScript
├── docs/                     # Generated site (auto-deployed)
└── .github/workflows/        # GitHub Actions
```

## Local Development

### Prerequisites

Install [uv](https://docs.astral.sh/uv/) (fast Python package manager):
```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or with pip
pip install uv
```

### Setup and Build

1. Install dependencies:
```bash
uv sync --no-install-project
```

2. Edit your CV data:
```bash
# Edit data/cv.yaml with your information
code data/cv.yaml
```

3. Validate your CV:
```bash
uv run python scripts/validate_cv.py
```

4. Build the site:
```bash
uv run python scripts/build.py
```

5. Open `docs/index.html` in your browser to preview

## Deployment

The site automatically deploys to GitHub Pages when you push to the main branch.

Configure GitHub Pages to serve from the `docs/` folder:
1. Go to repository Settings > Pages
2. Set Source to "Deploy from a branch"
3. Select branch: main, folder: /docs
4. Save

## Updating Your CV

Simply edit `data/cv.yaml` and push to GitHub. The site will automatically rebuild and deploy.

## 📊 Improving Your CV

- **`CV_REVIEW_AND_RECOMMENDATIONS.md`** - Expert CV review with specific improvement suggestions and rewritten examples
- **`prompts/cv_analysis.md`** - AI prompt template to analyze your CV using ChatGPT/Claude

## 📁 Key Files

- **`data/cv.yaml`** - Your CV data (edit this!)
- **`templates/`** - HTML templates (customize design)
- **`scripts/build.py`** - Build script
- **`docs/`** - Generated website (deploy this)

## Technologies

- **Package Manager**: UV (fast, modern Python dependencies)
- **Build**: Python 3.11+, Jinja2, PyYAML
- **Frontend**: Tailwind CSS, Vanilla JavaScript
- **Deployment**: GitHub Actions, GitHub Pages

## License

Personal CV - All rights reserved

