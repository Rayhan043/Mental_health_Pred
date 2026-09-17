# 🧠 Student Mental Health Prediction

A machine learning web application that predicts a student's **Mental Health Score** based on social media usage, study habits, physical activity, sleep, stress level, and demographic information.

The project follows an end-to-end ML workflow — from **data analysis and feature engineering to model training, hyperparameter tuning, model serialization, and FastAPI deployment**.

## 🚀 Project Overview

The goal is to build a regression model that estimates a student's mental health score from lifestyle and social-media-related behavioral features.

**Dataset:** 5,000 student records
**Target:** `Mental_Health_Score`
**Problem Type:** Regression

### Input Features

* Age
* Gender
* Country
* Academic Level
* Most Used Social Media Platform
* Purpose of Social Media Use
* Average Daily Social Media Usage
* Daily Phone Unlocks
* Study Hours
* Physical Activity Hours
* Sleep Hours per Night
* Stress Level

## 🔄 ML Workflow

```text
Dataset
   ↓
Data Cleaning
   ↓
EDA & Visualization
   ↓
Feature Engineering
   ↓
Train / Test Split
   ↓
Preprocessing Pipeline
   ├── Log Transformation
   ├── Standard Scaling
   ├── Ordinal Encoding
   └── One-Hot Encoding
   ↓
Model Training
   ├── Linear Regression
   ├── Random Forest
   └── Tuned Random Forest
   ↓
Hyperparameter Tuning
   ↓
Model Evaluation
   ↓
Model Serialization (.pkl)
   ↓
FastAPI REST API
   ↓
Web Interface
```

## 🤖 Models & Performance

Three regression approaches were evaluated:

| Model               |    Test R² |   Test MAE |  Test RMSE |
| ------------------- | ---------: | ---------: | ---------: |
| Linear Regression   |     0.7398 |     0.5362 |     0.6760 |
| Random Forest       |     0.8776 |     0.3472 |     0.4637 |
| Tuned Random Forest | **0.8936** | **0.3213** | **0.4324** |

The tuned Random Forest used:

```text
n_estimators = 300
criterion = squared_error
max_features = log2
```

Hyperparameters were selected using **GridSearchCV with 5-fold cross-validation**.

## 🧩 Preprocessing

The project uses a Scikit-learn `ColumnTransformer` and `Pipeline` to keep preprocessing and prediction consistent.

### Numerical Features

* StandardScaler

### Skewed Feature

* `Study_Hours`
* Log transformation using `log1p`
* StandardScaler

### Ordinal Feature

`Stress_Level` is encoded according to its natural order:

```text
Low → Medium → High → Very High
```

### Categorical Features

One-hot encoding is applied to nominal categorical variables with:

```python
OneHotEncoder(handle_unknown="ignore")
```

## ⚙️ Backend

The trained model is serialized using `joblib` and loaded by a **FastAPI** backend.

The API:

```text
POST /predict
```

accepts validated student information using **Pydantic** and returns the predicted mental health score.

Example response:

```json
{
  "predicted_mental_health_score": 6.78
}
```

## 🌐 Web Application

The project includes a browser-based interface where users can enter:

* Personal information
* Social media behavior
* Study hours
* Physical activity
* Sleep duration
* Phone usage
* Stress level

The frontend sends the information to the FastAPI `/predict` endpoint and displays the model prediction.

## 🛠️ Tech Stack

* Python
* NumPy
* Pandas
* Matplotlib
* Seaborn
* Scikit-learn
* Joblib
* FastAPI
* Pydantic
* HTML
* CSS
* JavaScript

## 📁 Project Structure

```text
Student_Mental_Health/
│
├── Mental_Health_Model.ipynb
├── Student Social Media And Mental Health Impact.csv
├── train_model.py
├── main.py
├── Mental_Health_Model.pkl
├── requirements.txt
├── index.html
├── style.css
└── script.js
```

## ▶️ Run Locally

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd Student_Mental_Health
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Start the FastAPI server

```bash
uvicorn main:app --reload
```

### 4. Open the application

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

## 📌 Important Note

This project is an educational machine learning application. The predicted score should **not be interpreted as a medical diagnosis or professional mental-health assessment**.
