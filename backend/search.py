import faiss
import json
import numpy as np
import os
import google.generativeai as genai

from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi


# =====================================================
# Load Environment Variables
# =====================================================

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

gemini_model = genai.GenerativeModel(
    "gemini-2.5-flash-lite"
)


# =====================================================
# Load Embedding Model
# =====================================================

model = SentenceTransformer(
    "BAAI/bge-small-en-v1.5"
)


# =====================================================
# Load FAISS Index
# =====================================================

index = faiss.read_index(
    "data/faiss.index"
)


# =====================================================
# Load Metadata
# =====================================================

with open("data/metadata.json", "r") as f:
    metadata = json.load(f)


# =====================================================
# Prepare BM25 Corpus
# =====================================================

documents = []

for item in metadata:

    text = (
        item["title"] + " " +
        item["category"] + " " +
        item["description"]
    )

    documents.append(text)

tokenized_corpus = [
    doc.lower().split()
    for doc in documents
]

bm25 = BM25Okapi(tokenized_corpus)


# =====================================================
# Semantic Search
# =====================================================

def semantic_search(query, top_k=3):

    query = query.strip()

    query_embedding = model.encode([query])

    distances, indices = index.search(
        np.array(query_embedding),
        top_k
    )

    results = []

    for idx, distance in zip(
        indices[0],
        distances[0]
    ):

        item = metadata[idx].copy()

        item["semantic_distance"] = float(distance)

        item["retrieval_type"] = "semantic"

        results.append(item)

    return results


# =====================================================
# BM25 Search
# =====================================================

def bm25_search(query, top_k=3):

    query = query.strip()

    tokenized_query = query.lower().split()

    scores = bm25.get_scores(tokenized_query)

    ranked_indices = np.argsort(scores)[::-1][:top_k]

    results = []

    for idx in ranked_indices:

        item = metadata[idx].copy()

        item["bm25_score"] = float(scores[idx])

        item["matched_terms"] = list(
            set(tokenized_query).intersection(
                set(documents[idx].lower().split())
            )
        )

        item["retrieval_type"] = "bm25"

        results.append(item)

    return results


# =====================================================
# Gemini Explanation
# =====================================================

def explain_result(query, result):

    prompt = f"""
    You are a search relevance debugging assistant.

    Query:
    {query}

    Search Result:
    Title: {result['title']}
    Category: {result['category']}
    Description: {result['description']}

    Explain:
    1. Why this result ranked highly
    2. Any possible relevance issue

    Keep it concise and technical.
    """

    try:

        response = gemini_model.generate_content(
            prompt
        )

        return response.text

    except Exception as e:

        return f"""
Explanation unavailable.

Possible reason:
{str(e)}
"""


# =====================================================
# Hybrid Search
# =====================================================

def hybrid_search(query, top_k=3):

    query = query.strip()

    semantic_results = semantic_search(
        query,
        top_k=top_k
    )

    bm25_results = bm25_search(
        query,
        top_k=top_k
    )

    combined = {}

    # ---------------------------------
    # Semantic Scoring
    # ---------------------------------

    for rank, item in enumerate(semantic_results):

        item_id = item["id"]

        combined[item_id] = {
            "data": item,
            "score": (top_k - rank) * 0.6
        }

    # ---------------------------------
    # BM25 Scoring
    # ---------------------------------

    for rank, item in enumerate(bm25_results):

        item_id = item["id"]

        if item_id not in combined:

            combined[item_id] = {
                "data": item,
                "score": 0
            }

        combined[item_id]["score"] += (
            (top_k - rank) * 0.4
        )

    # ---------------------------------
    # Sort Final Results
    # ---------------------------------

    ranked = sorted(
        combined.values(),
        key=lambda x: x["score"],
        reverse=True
    )

    results = []

    for item in ranked[:top_k]:

        result = item["data"]

        result["hybrid_score"] = item["score"]

        result["retrieval_type"] = "hybrid"

        result["explanation"] = explain_result(
            query,
            result
        )

        results.append(result)

    return results