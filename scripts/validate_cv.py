#!/usr/bin/env python3
"""
CV YAML Validation Script
Validates the structure and content of cv.yaml
"""

import yaml
import sys
from datetime import datetime
from pathlib import Path


def validate_date(date_str, field_name):
    """Validate date format (YYYY-MM-DD)"""
    if date_str is None:
        return True  # null dates are allowed for current positions
    
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
        return True
    except ValueError:
        print(f"❌ Invalid date format in {field_name}: {date_str} (expected YYYY-MM-DD)")
        return False


def validate_required_fields(data, fields, section_name):
    """Check if required fields exist"""
    errors = []
    for field in fields:
        if field not in data or data[field] is None:
            errors.append(f"Missing required field '{field}' in {section_name}")
    return errors


def validate_cv(cv_path):
    """Main validation function"""
    print(f"🔍 Validating CV at: {cv_path}")
    
    try:
        with open(cv_path, 'r', encoding='utf-8') as f:
            cv_data = yaml.safe_load(f)
    except FileNotFoundError:
        print(f"❌ File not found: {cv_path}")
        return False
    except yaml.YAMLError as e:
        print(f"❌ YAML parsing error: {e}")
        return False
    
    errors = []
    
    # Validate personal section
    if 'personal' not in cv_data:
        errors.append("Missing 'personal' section")
    else:
        errors.extend(validate_required_fields(
            cv_data['personal'],
            ['name', 'title', 'email'],
            'personal'
        ))
    
    # Validate work experience
    if 'work_experience' in cv_data:
        for idx, job in enumerate(cv_data['work_experience']):
            errors.extend(validate_required_fields(
                job,
                ['company', 'position', 'start_date'],
                f'work_experience[{idx}]'
            ))
            
            if 'start_date' in job:
                validate_date(job['start_date'], f'work_experience[{idx}].start_date')
            if 'end_date' in job:
                validate_date(job['end_date'], f'work_experience[{idx}].end_date')
    
    # Validate education
    if 'education' in cv_data:
        for idx, edu in enumerate(cv_data['education']):
            errors.extend(validate_required_fields(
                edu,
                ['degree', 'institution', 'start_date', 'end_date'],
                f'education[{idx}]'
            ))
            
            if 'start_date' in edu:
                validate_date(edu['start_date'], f'education[{idx}].start_date')
            if 'end_date' in edu:
                validate_date(edu['end_date'], f'education[{idx}].end_date')
    
    # Validate certifications
    if 'certifications' in cv_data:
        for idx, cert in enumerate(cv_data['certifications']):
            errors.extend(validate_required_fields(
                cert,
                ['name', 'issuer', 'date'],
                f'certifications[{idx}]'
            ))
            
            if 'date' in cert:
                validate_date(cert['date'], f'certifications[{idx}].date')
            if 'expiry' in cert and cert['expiry']:
                validate_date(cert['expiry'], f'certifications[{idx}].expiry')
    
    # Validate programming languages
    if 'programming_languages' in cv_data:
        for idx, lang in enumerate(cv_data['programming_languages']):
            errors.extend(validate_required_fields(
                lang,
                ['name', 'level'],
                f'programming_languages[{idx}]'
            ))
            
            if 'start_date' in lang and lang['start_date']:
                validate_date(lang['start_date'], f'programming_languages[{idx}].start_date')
    
    # Print results
    if errors:
        print("\n❌ Validation failed with the following errors:")
        for error in errors:
            print(f"  - {error}")
        return False
    else:
        print("✅ CV validation passed successfully!")
        return True


if __name__ == "__main__":
    cv_path = Path(__file__).parent.parent / "data" / "cv.yaml"
    
    if len(sys.argv) > 1:
        cv_path = Path(sys.argv[1])
    
    success = validate_cv(cv_path)
    sys.exit(0 if success else 1)

