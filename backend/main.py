from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from search import (
    semantic_search,
    bm25_search,
    hybrid_search
)

app = FastAPI(
    title="SearchLens API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():

    return {
        "message": "SearchLens running"
    }


@app.get("/search")
def search(
    query: str = Query(..., min_length=1),
    top_k: int = 3
):

    return {

        "query": query,

        "top_k": top_k,

        "semantic_results":
            semantic_search(query, top_k),

        "bm25_results":
            bm25_search(query, top_k),

        "hybrid_results":
            hybrid_search(query, top_k)
    }