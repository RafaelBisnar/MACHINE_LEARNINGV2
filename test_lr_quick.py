"""
Quick Test for Linear Regression Integration
Run this to verify Linear Regression is active and working
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def print_section(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_health():
    """Check if Linear Regression model is loaded"""
    print_section("1. CHECKING LINEAR REGRESSION STATUS")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        data = response.json()
        
        print(f"\nServer Status: {data['status']}")
        print(f"\nLinear Regression Model:")
        lr_status = data['models']['linear_regression']
        print(f"  ✓ Loaded: {lr_status['loaded']}")
        print(f"  ✓ Trained: {lr_status['trained']}")
        
        if lr_status['loaded'] and lr_status['trained']:
            print("\n✅ Linear Regression is ACTIVE and TRAINED!")
            return True
        else:
            print("\n❌ Linear Regression is NOT ready")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to Flask server!")
        print("   Start it with: cd ml-service && python app.py")
        return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_train_lr():
    """Train the Linear Regression model"""
    print_section("2. TRAINING LINEAR REGRESSION MODEL")
    
    try:
        # Check if already trained
        health_response = requests.get(f"{BASE_URL}/health", timeout=5)
        health_data = health_response.json()
        
        if health_data['models']['linear_regression']['trained']:
            print("\n✅ Model is already trained!")
            print("   Skipping re-training...")
            return True
        
        print("\nSending training request...")
        response = requests.post(
            f"{BASE_URL}/train-lr",
            json={},
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        data = response.json()
        
        if data.get('success'):
            print(f"\n✅ Training successful!")
            print(f"   Characters trained: {data.get('num_characters', 0)}")
            
            if 'metrics' in data:
                print(f"\nModel Performance:")
                print(f"   R² Score: {data['metrics']['r2_score']:.4f}")
                print(f"   MAE: {data['metrics']['mae']:.4f}")
                print(f"   RMSE: {data['metrics']['rmse']:.4f}")
            
            return True
        else:
            print(f"❌ Training failed: {data.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_predict_difficulty():
    """Test Linear Regression prediction"""
    print_section("3. TESTING LINEAR REGRESSION PREDICTION")
    
    test_character = {
        "name": "Iron Man",
        "description": "A billionaire genius inventor with a high-tech powered armor suit"
    }
    
    try:
        print(f"\nPredicting difficulty for: {test_character['name']}")
        print(f"Description: {test_character['description']}")
        
        response = requests.post(
            f"{BASE_URL}/predict-difficulty",
            json=test_character,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        data = response.json()
        
        if 'predicted_difficulty' in data:
            difficulty = data['predicted_difficulty']
            print(f"\n✅ Prediction successful!")
            print(f"   Predicted Difficulty: {difficulty:.2f}/10")
            
            if 'features_used' in data:
                print(f"\nFeatures analyzed:")
                for key, value in data['features_used'].items():
                    print(f"   - {key}: {value}")
            
            return True
        else:
            print(f"❌ Prediction failed: {data.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_feature_importance():
    """Check feature importance"""
    print_section("4. CHECKING FEATURE IMPORTANCE")
    
    try:
        response = requests.get(f"{BASE_URL}/feature-importance", timeout=5)
        data = response.json()
        
        if 'features' in data:
            print("\n✅ Feature importance retrieved!")
            print("\nMost important features for difficulty prediction:")
            
            for i, feature in enumerate(data['features'][:5], 1):
                print(f"   {i}. {feature['name']}: {feature['importance']:.4f}")
            
            return True
        else:
            print(f"❌ Failed: {data.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def main():
    print("\n╔═══════════════════════════════════════════════════════════╗")
    print("║   LINEAR REGRESSION VERIFICATION TEST                    ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    
    # Run all tests
    results = []
    
    # Test 1: Health check
    results.append(("Health Check", test_health()))
    
    # Test 2: Training (only if health check passed)
    if results[0][1]:
        results.append(("Training", test_train_lr()))
    else:
        print("\n⚠️ Skipping remaining tests - server not ready")
        return False
    
    # Test 3: Prediction
    if results[1][1]:
        results.append(("Prediction", test_predict_difficulty()))
    
    # Test 4: Feature importance
    if results[1][1]:
        results.append(("Feature Importance", test_feature_importance()))
    
    # Summary
    print_section("TEST SUMMARY")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"   {test_name:25s}: {status}")
    
    print(f"\n   Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 SUCCESS! Linear Regression is fully functional!")
        print("   Your system is ready to predict character difficulty!")
    else:
        print("\n⚠️ Some tests failed. Check the errors above.")
    
    print("\n" + "="*60 + "\n")
    
    return passed == total

if __name__ == "__main__":
    try:
        success = main()
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        exit(1)
