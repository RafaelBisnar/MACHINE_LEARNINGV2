"""
Test Naive Bayes Classifier
Quick test to verify Naive Bayes is working
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def print_section(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_health():
    """Check if Naive Bayes model is loaded"""
    print_section("1. CHECKING NAIVE BAYES STATUS")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        data = response.json()
        
        print(f"\nServer Status: {data['status']}")
        print(f"\nNaive Bayes Model:")
        nb_status = data['models']['naive_bayes']
        print(f"  ✓ Loaded: {nb_status['loaded']}")
        print(f"  ✓ Trained: {nb_status['trained']}")
        
        if nb_status['loaded'] and nb_status['trained']:
            print("\n✅ Naive Bayes is ACTIVE and TRAINED!")
            return True
        else:
            print("\n❌ Naive Bayes is NOT ready")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_predict_genre():
    """Test genre prediction"""
    print_section("2. TESTING GENRE PREDICTION")
    
    test_cases = [
        "I am Iron Man. With great power comes great responsibility.",
        "May the Force be with you. Do or do not, there is no try.",
        "I'll be back. Hasta la vista, baby."
    ]
    
    for i, text in enumerate(test_cases, 1):
        print(f"\n Test Case {i}: '{text[:50]}...'")
        
        try:
            response = requests.post(
                f"{BASE_URL}/predict-genre",
                json={"text": text, "top_k": 3},
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            data = response.json()
            
            if data.get('success'):
                print("  Genre Predictions:")
                for pred in data['predictions']:
                    print(f"    - {pred['genre']}: {pred['confidence']}")
            else:
                print(f"  ❌ Error: {data.get('error')}")
                
        except Exception as e:
            print(f"  ❌ ERROR: {e}")
    
    return True

def test_predict_universe():
    """Test universe prediction"""
    print_section("3. TESTING UNIVERSE PREDICTION")
    
    test_cases = [
        "I am vengeance, I am the night, I am Batman!",
        "With great power comes great responsibility.",
        "Do or do not, there is no try."
    ]
    
    for i, text in enumerate(test_cases, 1):
        print(f"\n Test Case {i}: '{text}'")
        
        try:
            response = requests.post(
                f"{BASE_URL}/predict-universe",
                json={"text": text, "top_k": 3},
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            data = response.json()
            
            if data.get('success'):
                print("  Universe Predictions:")
                for pred in data['predictions']:
                    print(f"    - {pred['universe']}: {pred['confidence']}")
            else:
                print(f"  ❌ Error: {data.get('error')}")
                
        except Exception as e:
            print(f"  ❌ ERROR: {e}")
    
    return True

def test_classify_character():
    """Test full character classification"""
    print_section("4. TESTING FULL CHARACTER CLASSIFICATION")
    
    test_character = {
        "name": "Tony Stark",
        "quote": "I am Iron Man",
        "source": "Iron Man",
        "description": "Billionaire genius inventor with powered armor"
    }
    
    print(f"\nClassifying character: {test_character['name']}")
    print(f"Quote: {test_character['quote']}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/classify-character",
            json=test_character,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        data = response.json()
        
        if data.get('success'):
            classification = data['classification']
            print(f"\n✅ Classification successful!")
            print(f"\n  Predicted Genre: {classification['predicted_genre']}")
            print(f"  Confidence: {classification['genre_confidence']}")
            print(f"\n  Predicted Universe: {classification['predicted_universe']}")
            print(f"  Confidence: {classification['universe_confidence']}")
            
            print(f"\n  Top Genre Predictions:")
            for pred in classification['all_genre_predictions'][:3]:
                print(f"    - {pred['genre']}: {pred['confidence']}")
            
            print(f"\n  Top Universe Predictions:")
            for pred in classification['all_universe_predictions'][:3]:
                print(f"    - {pred['universe']}: {pred['confidence']}")
            
            return True
        else:
            print(f"❌ Error: {data.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_model_info():
    """Get model information"""
    print_section("5. NAIVE BAYES MODEL INFORMATION")
    
    try:
        response = requests.get(f"{BASE_URL}/nb-info", timeout=5)
        data = response.json()
        
        if data.get('success'):
            info = data['model_info']
            print(f"\n✅ Model Information:")
            print(f"  Trained: {info['trained']}")
            
            if 'training_data' in info:
                td = info['training_data']
                print(f"  Characters trained: {td['num_characters']}")
                print(f"  Number of genres: {td['num_genres']}")
                print(f"  Number of universes: {td['num_universes']}")
                print(f"\n  Genres: {', '.join(td['genres'])}")
                print(f"  Universes: {', '.join(td['universes'])}")
            
            print(f"\n  Vocabulary size: {info.get('vocabulary_size', 'N/A')}")
            print(f"  Model type: {info.get('model_type', 'N/A')}")
            
            return True
        else:
            print(f"❌ Error: {data.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def main():
    print("\n╔═══════════════════════════════════════════════════════════╗")
    print("║   NAIVE BAYES CLASSIFIER VERIFICATION TEST               ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    
    # Run all tests
    results = []
    
    results.append(("Health Check", test_health()))
    
    if results[0][1]:
        results.append(("Genre Prediction", test_predict_genre()))
        results.append(("Universe Prediction", test_predict_universe()))
        results.append(("Character Classification", test_classify_character()))
        results.append(("Model Info", test_model_info()))
    
    # Summary
    print_section("TEST SUMMARY")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"   {test_name:30s}: {status}")
    
    print(f"\n   Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 SUCCESS! Naive Bayes is fully functional!")
        print("   Your system can now classify character genres and universes!")
    else:
        print("\n⚠️ Some tests failed. Check the errors above.")
    
    print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
