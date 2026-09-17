from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, OneHotEncoder, OrdinalEncoder, StandardScaler

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "Student Social Media And Mental Health Impact.csv"
MODEL_PATH = BASE_DIR / "Mental_Health_Model.pkl"

TOP_COUNTRIES = [
	"India", "USA", "Canada", "Australia", "UK",
	"Germany", "Mexico", "Turkey", "France",
]


def build_model() -> Pipeline:
	skew_columns = ["Study_Hours"]
	numeric_columns = [
		"Age", "Avg_Daily_Usage_Hours", "Daily_Unlocks",
		"Physical_Activity_Hours", "Sleep_Hours_Per_Night",
	]
	ordinal_columns = ["Stress_Level"]
	nominal_columns = [
		"Gender", "Academic_Level", "Most_Used_Platform",
		"Purpose_Of_Use", "Grouped_countries",
	]

	preprocessor = ColumnTransformer(transformers=[
		("skew_pipeline", Pipeline([
			("log_transformer", FunctionTransformer(np.log1p, validate=False)),
			("scaler", StandardScaler()),
		]), skew_columns),
		("num_pipeline", Pipeline([
			("scaler", StandardScaler()),
		]), numeric_columns),
		("ordinal_pipeline", Pipeline([
			("encoding", OrdinalEncoder(categories=[[
				"Low", "Medium", "High", "Very High",
			]]))
		]), ordinal_columns),
		("nominal_pipeline", Pipeline([
			("encoding", OneHotEncoder(handle_unknown="ignore")),
		]), nominal_columns),
	])

	return Pipeline([
		("preprocessore", preprocessor),
		("model", RandomForestRegressor(
			n_estimators=300,
			criterion="squared_error",
			max_features="log2",
			random_state=42,
			n_jobs=-1,
		)),
	])


def main() -> None:
	data = pd.read_csv(DATA_PATH)
	data["Grouped_countries"] = data["Country"].where(
		data["Country"].isin(TOP_COUNTRIES), "Other"
	)

	feature_columns = [
		"Study_Hours", "Age", "Avg_Daily_Usage_Hours", "Daily_Unlocks",
		"Physical_Activity_Hours", "Sleep_Hours_Per_Night", "Stress_Level",
		"Gender", "Academic_Level", "Most_Used_Platform", "Purpose_Of_Use",
		"Grouped_countries",
	]
	X = data[feature_columns]
	y = data["Mental_Health_Score"]
	X_train, X_test, y_train, y_test = train_test_split(
		X, y, test_size=0.30, random_state=42
	)

	model = build_model()
	model.fit(X_train, y_train)
	predictions = model.predict(X_test)
	joblib.dump(model, MODEL_PATH)

	print(f"Saved tuned model to {MODEL_PATH}")
	print(f"Test R2: {r2_score(y_test, predictions):.3f}")
	print(f"Test MAE: {mean_absolute_error(y_test, predictions):.3f}")
	print(f"Test prediction range: {predictions.min():.2f} - {predictions.max():.2f}")


if __name__ == "__main__":
	main()
