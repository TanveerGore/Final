"""
Token usage tracking and cost analytics for all agent calls.
Thread-safe singleton that accumulates usage across all endpoints.
Includes pipeline-level timing, percentile latencies, and success/failure tracking.
"""

import threading
import time
import logging
from typing import Dict, List, Optional
from dataclasses import dataclass, field

logger = logging.getLogger("TokenTracker")

# Pricing per 1M tokens for gemini-3.1-flash-lite-preview (estimate)
PRICING = {
    "input_per_1m": 0.075,   # $0.075 per 1M input tokens
    "output_per_1m": 0.30,   # $0.30 per 1M output tokens
}


@dataclass
class AgentCallRecord:
    """Single agent invocation record."""
    timestamp: float
    endpoint: str
    agent_name: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    input_cost: float
    output_cost: float
    total_cost: float
    latency_ms: float
    success: bool = True
    error_type: Optional[str] = None


@dataclass
class PipelineRecord:
    """Tracks an entire pipeline execution (multiple agent calls)."""
    pipeline_id: str
    endpoint: str
    start_time: float
    end_time: float = 0.0
    total_latency_ms: float = 0.0
    agent_count: int = 0
    success: bool = True
    error_message: Optional[str] = None


def _percentile(sorted_values: List[float], p: float) -> float:
    """Calculate the p-th percentile from a sorted list."""
    if not sorted_values:
        return 0.0
    k = (len(sorted_values) - 1) * (p / 100.0)
    f = int(k)
    c = f + 1
    if c >= len(sorted_values):
        return sorted_values[-1]
    return sorted_values[f] + (k - f) * (sorted_values[c] - sorted_values[f])


class TokenTracker:
    """Thread-safe token usage tracker with per-endpoint and per-agent analytics."""

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._records: List[AgentCallRecord] = []
        self._pipelines: List[PipelineRecord] = []
        self._rlock = threading.RLock()
        self._initialized = True

    def record(
        self,
        endpoint: str,
        agent_name: str,
        input_tokens: int,
        output_tokens: int,
        latency_ms: float = 0.0,
        success: bool = True,
        error_type: Optional[str] = None,
    ):
        """Record a single agent call's token usage."""
        total = input_tokens + output_tokens
        input_cost = (input_tokens / 1_000_000) * PRICING["input_per_1m"]
        output_cost = (output_tokens / 1_000_000) * PRICING["output_per_1m"]

        rec = AgentCallRecord(
            timestamp=time.time(),
            endpoint=endpoint,
            agent_name=agent_name,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total,
            input_cost=input_cost,
            output_cost=output_cost,
            total_cost=input_cost + output_cost,
            latency_ms=latency_ms,
            success=success,
            error_type=error_type,
        )

        with self._rlock:
            self._records.append(rec)

        logger.info(
            f"📊 [{agent_name}] in={input_tokens} out={output_tokens} "
            f"cost=${rec.total_cost:.6f} latency={latency_ms:.0f}ms "
            f"{'OK' if success else 'FAIL'}"
        )

    def record_pipeline(
        self,
        pipeline_id: str,
        endpoint: str,
        start_time: float,
        end_time: float,
        agent_count: int,
        success: bool = True,
        error_message: Optional[str] = None,
    ):
        """Record a complete pipeline execution."""
        rec = PipelineRecord(
            pipeline_id=pipeline_id,
            endpoint=endpoint,
            start_time=start_time,
            end_time=end_time,
            total_latency_ms=(end_time - start_time) * 1000,
            agent_count=agent_count,
            success=success,
            error_message=error_message,
        )
        with self._rlock:
            self._pipelines.append(rec)

        logger.info(
            f"📊 Pipeline [{pipeline_id}] {endpoint} "
            f"{rec.total_latency_ms:.0f}ms agents={agent_count} "
            f"{'OK' if success else 'FAIL'}"
        )

    def get_analytics(self) -> Dict:
        """Generate comprehensive analytics report."""
        with self._rlock:
            records = list(self._records)
            pipelines = list(self._pipelines)

        if not records:
            return {
                "total_calls": 0,
                "total_input_tokens": 0,
                "total_output_tokens": 0,
                "total_tokens": 0,
                "total_cost_usd": 0.0,
                "by_endpoint": {},
                "by_agent": {},
                "recent_calls": [],
                "pipelines": {},
                "reliability": {},
                "latency_percentiles": {},
            }

        total_input = sum(r.input_tokens for r in records)
        total_output = sum(r.output_tokens for r in records)
        total_cost = sum(r.total_cost for r in records)
        all_latencies = sorted([r.latency_ms for r in records if r.latency_ms > 0])
        avg_latency = sum(all_latencies) / len(all_latencies) if all_latencies else 0

        # Success/failure tracking
        success_count = sum(1 for r in records if r.success)
        failure_count = sum(1 for r in records if not r.success)
        success_rate = (success_count / len(records) * 100) if records else 0

        # Error type breakdown
        error_types: Dict[str, int] = {}
        for r in records:
            if not r.success and r.error_type:
                error_types[r.error_type] = error_types.get(r.error_type, 0) + 1

        # Percentile latencies (global)
        latency_percentiles = {}
        if all_latencies:
            latency_percentiles = {
                "p50_ms": round(_percentile(all_latencies, 50), 1),
                "p75_ms": round(_percentile(all_latencies, 75), 1),
                "p90_ms": round(_percentile(all_latencies, 90), 1),
                "p95_ms": round(_percentile(all_latencies, 95), 1),
                "p99_ms": round(_percentile(all_latencies, 99), 1),
                "min_ms": round(all_latencies[0], 1),
                "max_ms": round(all_latencies[-1], 1),
            }

        # Per-endpoint breakdown
        by_endpoint: Dict[str, Dict] = {}
        for r in records:
            ep = r.endpoint
            if ep not in by_endpoint:
                by_endpoint[ep] = {
                    "calls": 0,
                    "successes": 0,
                    "failures": 0,
                    "input_tokens": 0,
                    "output_tokens": 0,
                    "total_tokens": 0,
                    "total_cost_usd": 0.0,
                    "avg_latency_ms": 0.0,
                    "_latencies": [],
                }
            by_endpoint[ep]["calls"] += 1
            by_endpoint[ep]["successes"] += 1 if r.success else 0
            by_endpoint[ep]["failures"] += 0 if r.success else 1
            by_endpoint[ep]["input_tokens"] += r.input_tokens
            by_endpoint[ep]["output_tokens"] += r.output_tokens
            by_endpoint[ep]["total_tokens"] += r.total_tokens
            by_endpoint[ep]["total_cost_usd"] += r.total_cost
            by_endpoint[ep]["_latencies"].append(r.latency_ms)

        for ep in by_endpoint:
            lats = sorted(by_endpoint[ep].pop("_latencies"))
            by_endpoint[ep]["avg_latency_ms"] = round(sum(lats) / len(lats), 1) if lats else 0
            if lats:
                by_endpoint[ep]["p50_latency_ms"] = round(_percentile(lats, 50), 1)
                by_endpoint[ep]["p95_latency_ms"] = round(_percentile(lats, 95), 1)
            calls = by_endpoint[ep]["calls"]
            by_endpoint[ep]["success_rate_pct"] = round(
                by_endpoint[ep]["successes"] / calls * 100, 1
            ) if calls else 0

        # Per-agent breakdown
        by_agent: Dict[str, Dict] = {}
        for r in records:
            ag = r.agent_name
            if ag not in by_agent:
                by_agent[ag] = {
                    "calls": 0,
                    "successes": 0,
                    "failures": 0,
                    "input_tokens": 0,
                    "output_tokens": 0,
                    "total_tokens": 0,
                    "total_cost_usd": 0.0,
                    "_latencies": [],
                }
            by_agent[ag]["calls"] += 1
            by_agent[ag]["successes"] += 1 if r.success else 0
            by_agent[ag]["failures"] += 0 if r.success else 1
            by_agent[ag]["input_tokens"] += r.input_tokens
            by_agent[ag]["output_tokens"] += r.output_tokens
            by_agent[ag]["total_tokens"] += r.total_tokens
            by_agent[ag]["total_cost_usd"] += r.total_cost
            by_agent[ag]["_latencies"].append(r.latency_ms)

        for ag in by_agent:
            lats = sorted(by_agent[ag].pop("_latencies"))
            by_agent[ag]["avg_latency_ms"] = round(sum(lats) / len(lats), 1) if lats else 0
            if lats:
                by_agent[ag]["p50_latency_ms"] = round(_percentile(lats, 50), 1)
                by_agent[ag]["p95_latency_ms"] = round(_percentile(lats, 95), 1)
            calls = by_agent[ag]["calls"]
            by_agent[ag]["success_rate_pct"] = round(
                by_agent[ag]["successes"] / calls * 100, 1
            ) if calls else 0

        # Round costs
        for d in list(by_endpoint.values()) + list(by_agent.values()):
            d["total_cost_usd"] = round(d["total_cost_usd"], 6)

        # Most expensive endpoints
        sorted_endpoints = sorted(
            by_endpoint.items(), key=lambda x: x[1]["total_cost_usd"], reverse=True
        )

        # Pipeline analytics
        pipeline_analytics: Dict[str, Dict] = {}
        for p in pipelines:
            ep = p.endpoint
            if ep not in pipeline_analytics:
                pipeline_analytics[ep] = {
                    "total_runs": 0,
                    "successes": 0,
                    "failures": 0,
                    "_latencies": [],
                }
            pipeline_analytics[ep]["total_runs"] += 1
            pipeline_analytics[ep]["successes"] += 1 if p.success else 0
            pipeline_analytics[ep]["failures"] += 0 if p.success else 1
            pipeline_analytics[ep]["_latencies"].append(p.total_latency_ms)

        for ep in pipeline_analytics:
            lats = sorted(pipeline_analytics[ep].pop("_latencies"))
            pipeline_analytics[ep]["avg_latency_ms"] = round(sum(lats) / len(lats), 1) if lats else 0
            if lats:
                pipeline_analytics[ep]["p50_latency_ms"] = round(_percentile(lats, 50), 1)
                pipeline_analytics[ep]["p95_latency_ms"] = round(_percentile(lats, 95), 1)
            runs = pipeline_analytics[ep]["total_runs"]
            pipeline_analytics[ep]["success_rate_pct"] = round(
                pipeline_analytics[ep]["successes"] / runs * 100, 1
            ) if runs else 0

        # Recent calls (last 50)
        recent = [
            {
                "timestamp": r.timestamp,
                "endpoint": r.endpoint,
                "agent": r.agent_name,
                "input_tokens": r.input_tokens,
                "output_tokens": r.output_tokens,
                "total_tokens": r.total_tokens,
                "input_cost_usd": round(r.input_cost, 8),
                "output_cost_usd": round(r.output_cost, 8),
                "cost_usd": round(r.total_cost, 6),
                "latency_ms": round(r.latency_ms, 1),
                "success": r.success,
                "error_type": r.error_type,
                "tokens_per_second": round(
                    r.total_tokens / (r.latency_ms / 1000), 1
                ) if r.latency_ms > 0 else 0,
            }
            for r in records[-50:]
        ]

        # Efficiency metrics
        total_latency = sum(r.latency_ms for r in records)
        tokens_per_dollar = round(
            (total_input + total_output) / total_cost, 0
        ) if total_cost > 0 else 0
        avg_tokens_per_call = round(
            (total_input + total_output) / len(records), 1
        ) if records else 0
        avg_cost_per_call = round(
            total_cost / len(records), 6
        ) if records else 0
        input_output_ratio = round(
            total_input / total_output, 2
        ) if total_output > 0 else 0

        return {
            "total_calls": len(records),
            "total_input_tokens": total_input,
            "total_output_tokens": total_output,
            "total_tokens": total_input + total_output,
            "total_cost_usd": round(total_cost, 6),
            "avg_latency_ms": round(avg_latency, 1),
            "pricing": {
                "model": "gemini-3.1-flash-lite-preview",
                "input_per_1m_tokens_usd": PRICING["input_per_1m"],
                "output_per_1m_tokens_usd": PRICING["output_per_1m"],
            },
            "cost_breakdown": {
                "input_cost_usd": round(
                    (total_input / 1_000_000) * PRICING["input_per_1m"], 6
                ),
                "output_cost_usd": round(
                    (total_output / 1_000_000) * PRICING["output_per_1m"], 6
                ),
            },
            "reliability": {
                "total_successes": success_count,
                "total_failures": failure_count,
                "success_rate_pct": round(success_rate, 1),
                "error_types": error_types,
            },
            "latency_percentiles": latency_percentiles,
            "efficiency": {
                "tokens_per_dollar": tokens_per_dollar,
                "avg_tokens_per_call": avg_tokens_per_call,
                "avg_cost_per_call_usd": avg_cost_per_call,
                "input_output_ratio": input_output_ratio,
                "total_processing_time_s": round(total_latency / 1000, 2),
            },
            "by_endpoint": dict(sorted_endpoints),
            "by_agent": by_agent,
            "pipelines": pipeline_analytics,
            "most_expensive_agent": (
                max(by_agent.items(), key=lambda x: x[1]["total_cost_usd"])[0]
                if by_agent
                else None
            ),
            "most_called_endpoint": (
                max(by_endpoint.items(), key=lambda x: x[1]["calls"])[0]
                if by_endpoint
                else None
            ),
            "least_reliable_agent": (
                min(by_agent.items(), key=lambda x: x[1]["success_rate_pct"])[0]
                if by_agent and any(a["failures"] > 0 for a in by_agent.values())
                else None
            ),
            "slowest_agent": (
                max(by_agent.items(), key=lambda x: x[1]["avg_latency_ms"])[0]
                if by_agent
                else None
            ),
            "heaviest_single_call": (
                {
                    "agent": max(records, key=lambda r: r.total_tokens).agent_name,
                    "endpoint": max(records, key=lambda r: r.total_tokens).endpoint,
                    "total_tokens": max(records, key=lambda r: r.total_tokens).total_tokens,
                    "cost_usd": round(max(records, key=lambda r: r.total_tokens).total_cost, 6),
                }
                if records else None
            ),
            "recent_calls": recent,
        }

    def reset(self):
        """Clear all records."""
        with self._rlock:
            self._records.clear()
            self._pipelines.clear()


# Global singleton
tracker = TokenTracker()
