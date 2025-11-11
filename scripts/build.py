#!/usr/bin/env python3
"""
CV Site Builder
Generates static HTML from YAML data and Jinja2 templates
"""

import yaml
import shutil
from datetime import datetime
from dateutil.relativedelta import relativedelta
from pathlib import Path
from jinja2 import Environment, FileSystemLoader


class CVBuilder:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.data_dir = self.project_root / "data"
        self.templates_dir = self.project_root / "templates"
        self.static_dir = self.project_root / "static"
        self.output_dir = self.project_root / "docs"
        
        # Setup Jinja2
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(self.templates_dir)),
            trim_blocks=True,
            lstrip_blocks=True
        )
        
        # Add custom filters
        self.jinja_env.filters['calculate_duration'] = self.calculate_duration
        self.jinja_env.filters['format_date'] = self.format_date
        self.jinja_env.filters['calculate_years'] = self.calculate_years
        self.jinja_env.filters['is_active_cert'] = self.is_active_cert
    
    def load_cv_data(self):
        """Load CV data from YAML"""
        cv_path = self.data_dir / "cv.yaml"
        print(f"📖 Loading CV data from: {cv_path}")
        
        with open(cv_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
    
    def calculate_duration(self, start_date, end_date=None):
        """Calculate duration between two dates"""
        if isinstance(start_date, str):
            start = datetime.strptime(start_date, "%Y-%m-%d")
        else:
            start = start_date
        
        if end_date is None:
            end = datetime.now()
        elif isinstance(end_date, str):
            end = datetime.strptime(end_date, "%Y-%m-%d")
        else:
            end = end_date
        
        delta = relativedelta(end, start)
        
        parts = []
        if delta.years > 0:
            parts.append(f"{delta.years} yr{'s' if delta.years != 1 else ''}")
        if delta.months > 0:
            parts.append(f"{delta.months} mo{'s' if delta.months != 1 else ''}")
        
        return " ".join(parts) if parts else "< 1 mo"
    
    def calculate_years(self, start_date):
        """Calculate years from start date to now"""
        if isinstance(start_date, str):
            start = datetime.strptime(start_date, "%Y-%m-%d")
        else:
            start = start_date
        
        delta = relativedelta(datetime.now(), start)
        years = delta.years
        months = delta.months
        
        if months >= 6:
            years += 1
        
        return years
    
    def format_date(self, date_str, format="%b %Y"):
        """Format date string"""
        if date_str is None:
            return "Present"
        
        if isinstance(date_str, str):
            date = datetime.strptime(date_str, "%Y-%m-%d")
        else:
            date = date_str
        
        return date.strftime(format)
    
    def is_active_cert(self, expiry_date):
        """Check if certification is still active"""
        if expiry_date is None:
            return True
        
        if isinstance(expiry_date, str):
            expiry = datetime.strptime(expiry_date, "%Y-%m-%d")
        else:
            expiry = expiry_date
        
        return expiry > datetime.now()
    
    def prepare_output_dir(self):
        """Create/clean output directory"""
        print(f"📁 Preparing output directory: {self.output_dir}")
        
        if self.output_dir.exists():
            # Clean docs directory but keep .git if it exists
            for item in self.output_dir.iterdir():
                if item.name != '.git':
                    if item.is_file():
                        item.unlink()
                    elif item.is_dir():
                        shutil.rmtree(item)
        else:
            self.output_dir.mkdir(parents=True)
    
    def copy_static_files(self):
        """Copy static files to output directory"""
        print("📋 Copying static files...")
        
        if self.static_dir.exists():
            output_static = self.output_dir / "static"
            if output_static.exists():
                shutil.rmtree(output_static)
            shutil.copytree(self.static_dir, output_static)
    
    def render_template(self, template_name, context, output_filename):
        """Render a Jinja2 template and save to output directory"""
        print(f"🎨 Rendering {template_name} -> {output_filename}")
        
        template = self.jinja_env.get_template(template_name)
        html_content = template.render(**context)
        
        output_path = self.output_dir / output_filename
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
    
    def build(self):
        """Main build process"""
        print("\n" + "="*60)
        print("🚀 Building CV Site")
        print("="*60 + "\n")
        
        # Load data
        cv_data = self.load_cv_data()
        
        # Prepare output
        self.prepare_output_dir()
        
        # Copy static files
        self.copy_static_files()
        
        # Build context
        context = {
            'cv': cv_data,
            'build_date': datetime.now(),
            'current_year': datetime.now().year
        }
        
        # Render CV page (as index)
        self.render_template('cv.html', context, 'index.html')
        
        # Render portfolio page
        self.render_template('portfolio.html', context, 'portfolio.html')
        
        print("\n" + "="*60)
        print("✅ Build complete!")
        print(f"📂 Output directory: {self.output_dir}")
        print("="*60 + "\n")


if __name__ == "__main__":
    # Get project root (parent of scripts directory)
    project_root = Path(__file__).parent.parent
    
    # Build the site
    builder = CVBuilder(project_root)
    builder.build()

