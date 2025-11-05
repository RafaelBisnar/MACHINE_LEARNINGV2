# MACHINE_LEARNINGV2
Machine Learning Character Guessing Game - Charactle

A full-stack application featuring multiple ML algorithms (K-NN, Linear Regression, Naive Bayes, SVM, Decision Trees, and Neural Networks) for character prediction and analysis.

## 🚀 Quick Start

### Local Development

**Backend (Node.js + Express)**
```bash
pnpm install
pnpm dev
```

**ML Service (Python + Flask)**
```bash
cd ml-service
pip install -r requirements.txt
python app.py
```

Visit: http://localhost:8080

## 📦 Deployment

**Deploy to Render.com** - See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for complete instructions

**Quick Deploy:**
1. Push to GitHub
2. Create two Render services (ML service + Main app)
3. Set ML_SERVICE_URL environment variable
4. Done! 🎉

## 🧠 ML Models

- **K-NN**: Character similarity matching
- **Linear Regression**: Difficulty prediction
- **Naive Bayes**: Genre/Universe classification
- **SVM**: Advanced character classification
- **Decision Trees**: Rule-based prediction
- **Neural Networks**: Deep learning classifier

## 📄 Documentation

- [Deployment Guide](./RENDER_DEPLOYMENT.md)
- [ML Algorithms Summary](./ML_ALGORITHMS_SUMMARY.md)
- [Project Structure](./AGENTS.md)
