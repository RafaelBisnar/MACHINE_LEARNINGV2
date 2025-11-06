"""
Test Linear Regression Difficulty Prediction
Run this to verify the Linear Regression model is working correctly
"""

import requests
import json
from colorama import Fore, Style, init

init(autoreset=True)

BASE_URL = "http://localhost:5000"

def print_section(title):
    print(f"\n{Fore.CYAN}{'='*60}")
    print(f"{Fore.CYAN}{title}")
    print(f"{Fore.CYAN}{'='*60}\n")

def test_train_model():
    """Test 1: Train the Linear Regression model"""
    print_section("TEST 1: Training Linear Regression Model")
    
    try:
        response = requests.post(
            f"{BASE_URL}/train-lr",
            headers={'Content-Type': 'application/json'},
            json={}
        )
        data = response.json()
        
        if response.status_code == 200:
            print(f"{Fore.GREEN}✓ Model trained successfully!")
            print(f"  R² Score: {data.get('r2_score', 'N/A'):.4f}")
            print(f"  Mean Squared Error: {data.get('mse', 'N/A'):.4f}")
            print(f"  Training samples: {data.get('training_samples', 'N/A')}")
            print(f"  Features used: {', '.join(data.get('features', []))}")
            return True
        else:
            print(f"{Fore.RED}✗ Training failed: {data}")
            return False
    except Exception as e:
        print(f"{Fore.RED}✗ Error: {e}")
        return False

def test_difficulty_rankings():
    """Test 2: Get difficulty rankings"""
    print_section("TEST 2: Getting Difficulty Rankings")
    
    try:
        response = requests.get(f"{BASE_URL}/difficulty-rankings")
        data = response.json()
        
        if response.status_code == 200:
            rankings = data.get('rankings', [])
            print(f"{Fore.GREEN}✓ Retrieved {len(rankings)} character rankings\n")
            
            # Show top 10 easiest (highest difficulty scores)
            print(f"{Fore.YELLOW}Top 10 EASIEST to guess:")
            print(f"{'Rank':<6} {'Character':<25} {'Difficulty':<12}")
            print("-" * 45)
            for char in rankings[:10]:
                rank = char.get('rank', 'N/A')
                name = char.get('character', 'Unknown')
                diff = char.get('difficulty', 0)
                print(f"{rank:<6} {name:<25} {diff:.2f}/10")
            
            # Show bottom 10 hardest (lowest difficulty scores)
            print(f"\n{Fore.YELLOW}Top 10 HARDEST to guess:")
            print(f"{'Rank':<6} {'Character':<25} {'Difficulty':<12}")
            print("-" * 45)
            for char in rankings[-10:]:
                rank = char.get('rank', 'N/A')
                name = char.get('character', 'Unknown')
                diff = char.get('difficulty', 0)
                print(f"{rank:<6} {name:<25} {diff:.2f}/10")
            
            return True
        else:
            print(f"{Fore.RED}✗ Failed to get rankings: {data}")
            return False
    except Exception as e:
        print(f"{Fore.RED}✗ Error: {e}")
        return False

def test_predict_difficulty():
    """Test 3: Predict difficulty for specific characters"""
    print_section("TEST 3: Predicting Difficulty for Specific Characters")
    
    test_characters = ["Spider-Man", "Iron Man", "Batman", "Wonder Woman", "Thanos"]
    
    for char_name in test_characters:
        try:
            response = requests.post(
                f"{BASE_URL}/predict-difficulty",
                json={"character_name": char_name}
            )
            data = response.json()
            
            if response.status_code == 200:
                diff = data.get('predicted_difficulty', 0)
                conf = data.get('confidence', 0)
                print(f"{Fore.GREEN}✓ {char_name:<20} → Difficulty: {diff:.2f}/10 (confidence: {conf:.2%})")
            else:
                print(f"{Fore.RED}✗ {char_name:<20} → Error: {data.get('error', 'Unknown')}")
        except Exception as e:
            print(f"{Fore.RED}✗ {char_name:<20} → Error: {e}")

def test_feature_importance():
    """Test 4: Check which features matter most"""
    print_section("TEST 4: Feature Importance Analysis")
    
    try:
        response = requests.get(f"{BASE_URL}/feature-importance")
        data = response.json()
        
        if response.status_code == 200:
            print(f"{Fore.GREEN}✓ Feature importance retrieved\n")
            print(f"Model R² Score: {data.get('model_score', 'N/A'):.4f}\n")
            
            features = data.get('feature_importance', [])
            print(f"{'Feature':<25} {'Importance':<12} {'Description':<40}")
            print("-" * 80)
            for feat in features:
                name = feat.get('feature', 'Unknown')
                importance = feat.get('importance', 0)
                desc = feat.get('description', '')
                bar = "█" * int(importance * 50)
                print(f"{name:<25} {importance:<12.2%} {bar}")
            
            return True
        else:
            print(f"{Fore.RED}✗ Failed to get feature importance: {data}")
            return False
    except Exception as e:
        print(f"{Fore.RED}✗ Error: {e}")
        return False

def test_model_accuracy():
    """Test 5: Verify predictions make sense"""
    print_section("TEST 5: Sanity Check - Do Predictions Make Sense?")
    
    # Popular characters should have HIGH difficulty (easy to guess)
    # Obscure characters should have LOW difficulty (hard to guess)
    
    expectations = {
        "Spider-Man": {"min": 7.0, "max": 10.0, "reason": "Very popular character"},
        "Iron Man": {"min": 7.0, "max": 10.0, "reason": "MCU main character"},
        "Batman": {"min": 7.0, "max": 10.0, "reason": "Iconic DC hero"},
    }
    
    passed = 0
    failed = 0
    
    for char_name, expect in expectations.items():
        try:
            response = requests.post(
                f"{BASE_URL}/predict-difficulty",
                json={"character_name": char_name}
            )
            data = response.json()
            
            if response.status_code == 200:
                diff = data.get('predicted_difficulty', 0)
                
                if expect['min'] <= diff <= expect['max']:
                    print(f"{Fore.GREEN}✓ {char_name:<20} → {diff:.2f}/10 (Expected {expect['min']}-{expect['max']}) - {expect['reason']}")
                    passed += 1
                else:
                    print(f"{Fore.RED}✗ {char_name:<20} → {diff:.2f}/10 (Expected {expect['min']}-{expect['max']}) - {expect['reason']}")
                    failed += 1
        except Exception as e:
            print(f"{Fore.RED}✗ {char_name:<20} → Error: {e}")
            failed += 1
    
    print(f"\n{Fore.CYAN}Results: {passed} passed, {failed} failed")
    return failed == 0

def main():
    """Run all tests"""
    print(f"\n{Fore.MAGENTA}{'='*60}")
    print(f"{Fore.MAGENTA}LINEAR REGRESSION DIFFICULTY PREDICTION TEST SUITE")
    print(f"{Fore.MAGENTA}{'='*60}")
    
    # Check if ML service is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=2)
        print(f"{Fore.GREEN}✓ ML Service is running\n")
    except:
        print(f"{Fore.RED}✗ ML Service is NOT running!")
        print(f"{Fore.YELLOW}Please start it with: cd ml-service && python app.py")
        return
    
    # Run tests
    results = []
    results.append(("Train Model", test_train_model()))
    results.append(("Difficulty Rankings", test_difficulty_rankings()))
    results.append(("Predict Difficulty", test_predict_difficulty()))
    results.append(("Feature Importance", test_feature_importance()))
    results.append(("Accuracy Check", test_model_accuracy()))
    
    # Summary
    print_section("TEST SUMMARY")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = f"{Fore.GREEN}PASSED" if result else f"{Fore.RED}FAILED"
        print(f"{test_name:<30} {status}")
    
    print(f"\n{Fore.CYAN}Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print(f"{Fore.GREEN}\n🎉 All tests passed! Linear Regression is working correctly!")
    else:
        print(f"{Fore.YELLOW}\n⚠️  Some tests failed. Check the errors above.")

if __name__ == "__main__":
    main()
