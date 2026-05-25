import pandas as pd
import numpy as np
import faiss
import json

from sentence_transformers import SentenceTransformer

# Load dataset
df = pd.read_csv("data/products.csv")

# Combine searchable text
df["text"] = (
    df["title"] + " " +
    df["category"] + " " +
    df["description"]
)

# Load embedding model
model = SentenceTransformer("BAAI/bge-small-en-v1.5")

# Generate embeddings
embeddings = model.encode(
    df["text"].tolist(),
    convert_to_numpy=True
)

# Create FAISS index
dimension = embeddings.shape[1]

index = faiss.IndexFlatL2(dimension)
index.add(embeddings)

# Save index
faiss.write_index(index, "data/faiss.index")

# Save metadata
metadata = df.to_dict(orient="records")

with open("data/metadata.json", "w") as f:
    json.dump(metadata, f, indent=2)

print("Ingestion completed.")