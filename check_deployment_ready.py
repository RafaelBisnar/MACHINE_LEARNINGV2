"""
Pre-deployment check script
Verifies that your project is ready for Render deployment
"""

import os
import sys
import json

def check_file_exists(filepath, required=True):
    """Check if a file exists"""
    exists = os.path.exists(filepath)
    status = "✓" if exists else "✗"
    importance = "REQUIRED" if required else "OPTIONAL"
    print(f"{status} {filepath} {'(exists)' if exists else f'(MISSING - {importance})'}")
    return exists

def check_package_json():
    """Verify package.json has required scripts"""
    print("\n📦 Checking package.json...")
    try:
        with open('package.json', 'r') as f:
            pkg = json.load(f)
        
        scripts = pkg.get('scripts', {})
        required_scripts = ['build', 'start']
        
        for script in required_scripts:
            if script in scripts:
                print(f"✓ Script '{script}': {scripts[script]}")
            else:
                print(f"✗ MISSING script '{script}'")
                return False
        return True
    except Exception as e:
        print(f"✗ Error reading package.json: {e}")
        return False

def check_requirements():
    """Verify Python requirements.txt"""
    print("\n🐍 Checking requirements.txt...")
    try:
        with open('ml-service/requirements.txt', 'r') as f:
            reqs = f.read()
        
        required_packages = ['flask', 'gunicorn', 'scikit-learn', 'torch']
        
        for pkg in required_packages:
            if pkg in reqs.lower():
                print(f"✓ {pkg} found")
            else:
                print(f"✗ MISSING: {pkg}")
                return False
        return True
    except Exception as e:
        print(f"✗ Error reading requirements.txt: {e}")
        return False

def check_git_status():
    """Check git status"""
    print("\n📝 Checking git status...")
    result = os.system('git status --porcelain > nul 2>&1')
    if result == 0:
        print("✓ Git repository detected")
        os.system('git status')
        return True
    else:
        print("✗ Not a git repository or git not installed")
        return False

def main():
    print("="*60)
    print("  RENDER DEPLOYMENT PRE-FLIGHT CHECK")
    print("="*60)
    
    checks = []
    
    # Check essential files
    print("\n📁 Checking required files...")
    checks.append(check_file_exists('package.json', required=True))
    checks.append(check_file_exists('render.yaml', required=False))
    checks.append(check_file_exists('ml-service/app.py', required=True))
    checks.append(check_file_exists('ml-service/requirements.txt', required=True))
    checks.append(check_file_exists('server/index.ts', required=True))
    checks.append(check_file_exists('server/routes/ml.ts', required=True))
    
    # Check package.json
    checks.append(check_package_json())
    
    # Check requirements.txt
    checks.append(check_requirements())
    
    # Check git
    checks.append(check_git_status())
    
    # Summary
    print("\n" + "="*60)
    print("  SUMMARY")
    print("="*60)
    
    passed = sum(checks)
    total = len(checks)
    
    if passed == total:
        print(f"✓ All checks passed! ({passed}/{total})")
        print("\n🚀 You're ready to deploy to Render!")
        print("\nNext steps:")
        print("1. git add .")
        print("2. git commit -m 'Ready for Render deployment'")
        print("3. git push origin main")
        print("4. Follow instructions in RENDER_DEPLOYMENT.md")
        return 0
    else:
        print(f"⚠ Some checks failed ({passed}/{total} passed)")
        print("\nPlease fix the issues above before deploying.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
