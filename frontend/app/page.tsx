"use client";

import axios from "axios";
import { useState } from "react";

export default function Home() {

  const [query, setQuery] = useState("");

  const [results, setResults] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const search = async () => {

    if (!query.trim()) return;

    setLoading(true);

    try {

      const response = await axios.get(
        "http://127.0.0.1:8000/search",
        {
          params: {
            query,
            top_k: 5
          }
        }
      );

      setResults(response.data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  };

  return (

    <main
      className="
        min-h-screen
        bg-gradient-to-br
        from-slate-950
        via-purple-950
        to-slate-900
        text-white
        p-8
      "
    >

      <div className="max-w-7xl mx-auto">

        {/* HERO */}

        <div className="mb-12">

          <div
            className="
              inline-block
              px-4
              py-2
              rounded-full
              bg-purple-500/20
              border
              border-purple-400/30
              text-purple-200
              text-sm
              mb-5
            "
          >
            AI Search Relevance Debugger
          </div>

          <h1
            className="
              text-6xl
              font-black
              mb-4
              bg-gradient-to-r
              from-cyan-400
              via-purple-400
              to-pink-400
              text-transparent
              bg-clip-text
            "
          >
            SearchLens
          </h1>

          <p className="text-gray-300 text-xl max-w-3xl">
            Compare semantic search, BM25 retrieval,
            and hybrid ranking with AI-generated
            relevance analysis.
          </p>

        </div>

        {/* SEARCH BOX */}

        <div
          className="
            bg-white/10
            backdrop-blur-xl
            border
            border-white/10
            rounded-3xl
            p-6
            shadow-2xl
            mb-12
          "
        >

          <div className="flex gap-4">

            <input
              type="text"
              placeholder="Try: wireless earbuds"
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              className="
                flex-1
                bg-black/20
                border
                border-white/10
                rounded-2xl
                p-4
                text-lg
                outline-none
                focus:border-cyan-400
                transition
              "
            />

            <button
              onClick={search}
              className="
                px-8
                rounded-2xl
                bg-gradient-to-r
                from-cyan-500
                to-purple-500
                font-semibold
                text-lg
                hover:scale-105
                transition
                shadow-lg
              "
            >
              Search
            </button>

          </div>

        </div>

        {/* LOADING */}

        {loading && (

          <div
            className="
              text-xl
              animate-pulse
              text-cyan-300
            "
          >
            Running retrieval pipeline...
          </div>
        )}

        {/* RESULTS */}

        {results && (

          <div className="space-y-16">

            <ResultSection
              title="Semantic Search"
              subtitle="Meaning-based retrieval using embeddings"
              gradient="from-cyan-500 to-blue-500"
              items={results.semantic_results}
            />

            <ResultSection
              title="BM25 Search"
              subtitle="Keyword-based lexical retrieval"
              gradient="from-pink-500 to-orange-500"
              items={results.bm25_results}
            />

            <ResultSection
              title="Hybrid Search"
              subtitle="Combined semantic + lexical ranking"
              gradient="from-purple-500 to-cyan-500"
              items={results.hybrid_results}
            />

          </div>
        )}

      </div>

    </main>
  );
}

function ResultSection({
  title,
  subtitle,
  gradient,
  items
}: any) {

  return (

    <section>

      <div className="mb-6">

        <h2
          className={`
            text-4xl
            font-bold
            mb-2
            bg-gradient-to-r
            ${gradient}
            text-transparent
            bg-clip-text
          `}
        >
          {title}
        </h2>

        <p className="text-gray-400">
          {subtitle}
        </p>

      </div>

      <div className="grid gap-6">

        {items.map((item: any, index: number) => (

          <div
            key={index}
            className="
              bg-white/10
              backdrop-blur-xl
              border
              border-white/10
              rounded-3xl
              p-6
              shadow-2xl
              hover:scale-[1.01]
              transition
            "
          >

            {/* HEADER */}

            <div className="mb-5">

              <div className="flex items-center justify-between">

                <h3 className="text-2xl font-bold">
                  {item.title}
                </h3>

                <span
                  className="
                    bg-purple-500/20
                    border
                    border-purple-400/20
                    px-3
                    py-1
                    rounded-full
                    text-sm
                    text-purple-200
                  "
                >
                  {item.category}
                </span>

              </div>

            </div>

            {/* DESCRIPTION */}

            <p className="text-gray-300 mb-6">
              {item.description}
            </p>

            {/* METRICS */}

            <div className="flex flex-wrap gap-3 mb-6">

              {item.semantic_distance !== undefined && (

                <MetricBadge
                  label="Semantic"
                  value={item.semantic_distance.toFixed(4)}
                  color="cyan"
                />
              )}

              {item.bm25_score !== undefined && (

                <MetricBadge
                  label="BM25"
                  value={item.bm25_score.toFixed(4)}
                  color="pink"
                />
              )}

              {item.hybrid_score !== undefined && (

                <MetricBadge
                  label="Hybrid"
                  value={item.hybrid_score.toFixed(4)}
                  color="purple"
                />
              )}

            </div>

            {/* MATCHED TERMS */}

            {item.matched_terms &&
              item.matched_terms.length > 0 && (

              <div className="mb-6">

                <p className="text-sm text-gray-400 mb-3">
                  Matched Terms
                </p>

                <div className="flex flex-wrap gap-2">

                  {item.matched_terms.map(
                    (term: string, idx: number) => (

                    <span
                      key={idx}
                      className="
                        bg-cyan-500/20
                        text-cyan-200
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        border
                        border-cyan-400/20
                      "
                    >
                      {term}
                    </span>
                  ))}

                </div>

              </div>
            )}

            {/* AI ANALYSIS */}

            {item.explanation && (

              <div
                className="
                  bg-black/20
                  border
                  border-white/10
                  rounded-2xl
                  p-5
                "
              >

                <p
                  className="
                    text-purple-300
                    font-semibold
                    mb-3
                  "
                >
                  AI Relevance Analysis
                </p>

                <p
                  className="
                    whitespace-pre-line
                    text-gray-300
                    leading-relaxed
                  "
                >
                  {item.explanation}
                </p>

              </div>
            )}

          </div>
        ))}

      </div>

    </section>
  );
}

function MetricBadge({
  label,
  value,
  color
}: any) {

  const colors: any = {

    cyan:
      "bg-cyan-500/20 text-cyan-200 border-cyan-400/20",

    pink:
      "bg-pink-500/20 text-pink-200 border-pink-400/20",

    purple:
      "bg-purple-500/20 text-purple-200 border-purple-400/20"
  };

  return (

    <div
      className={`
        px-4
        py-2
        rounded-xl
        text-sm
        border
        ${colors[color]}
      `}
    >
      {label}: {value}
    </div>
  );
}