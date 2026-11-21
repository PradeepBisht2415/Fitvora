'use client';

import React, { useState } from 'react';
import type { WeightEntry } from '@/types/database.types';

interface WeightChartProps {
  entries: WeightEntry[];
  baselineWeight?: number | null;
  targetDirection?: string | null;
}

export function WeightChart({
  entries,
  baselineWeight,
  targetDirection,
}: WeightChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    entry: WeightEntry;
    x: number;
    y: number;
  } | null>(null);

  if (!entries || entries.length < 2) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-100 bg-[#FFFDF7] p-6 text-center">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-[#075B2B]">
          📈
        </div>
        <h4 className="text-sm font-bold text-[#1A2E1C]">More data needed for trendline</h4>
        <p className="mt-1 max-w-xs text-xs text-gray-500">
          Record at least 2 weight entries over different days to visualize your trend graph and weekly pacing.
        </p>
      </div>
    );
  }

  // Sort ascending by date
  const sorted = [...entries].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  const weights = sorted.map((e) => Number(e.weight_kg));
  if (baselineWeight) {
    weights.push(baselineWeight);
  }

  const minWeight = Math.floor(Math.min(...weights) - 1);
  const maxWeight = Math.ceil(Math.max(...weights) + 1);
  const weightRange = maxWeight - minWeight || 1;

  // Chart dimensions
  const width = 640;
  const height = 240;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = sorted.map((entry, index) => {
    const x = paddingLeft + (index / (sorted.length - 1)) * chartWidth;
    const y =
      paddingTop +
      chartHeight -
      ((Number(entry.weight_kg) - minWeight) / weightRange) * chartHeight;
    return { x, y, entry };
  });

  // Build SVG path
  const pathD = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = points[i - 1];
    if (!prev) return acc;
    // Bezier control points
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
  }, '');

  const firstPt = points[0];
  const lastPt = points[points.length - 1];

  // Fill path closing to the bottom
  const areaD =
    firstPt && lastPt
      ? `${pathD} L ${lastPt.x} ${paddingTop + chartHeight} L ${firstPt.x} ${
          paddingTop + chartHeight
        } Z`
      : pathD;

  // Baseline Y position
  const baselineY =
    baselineWeight && baselineWeight >= minWeight && baselineWeight <= maxWeight
      ? paddingTop +
        chartHeight -
        ((baselineWeight - minWeight) / weightRange) * chartHeight
      : null;

  // Y-axis grid ticks (3 ticks: min, mid, max)
  const midWeight = ((minWeight + maxWeight) / 2).toFixed(1);
  const ticks = [
    { label: `${maxWeight} kg`, y: paddingTop },
    { label: `${midWeight} kg`, y: paddingTop + chartHeight / 2 },
    { label: `${minWeight} kg`, y: paddingTop + chartHeight },
  ];

  const latestEntry = sorted[sorted.length - 1];

  return (
    <div className="relative w-full rounded-2xl border border-emerald-100 bg-white p-4 shadow-xs sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-[#1A2E1C]">Weight Trend</h3>
          <p className="text-xs text-gray-500">
            {sorted.length} entries tracked • {targetDirection ? targetDirection.replace('_', ' ') : 'Balanced lifestyle'}
          </p>
        </div>

        {baselineWeight && latestEntry && (
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="h-0.5 w-4 border-b-2 border-dashed border-gray-400" />
              Baseline: {baselineWeight} kg
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#075B2B]">
              <span className="h-2 w-2 rounded-full bg-[#2FAF37]" />
              Latest: {Number(latestEntry.weight_kg).toFixed(1)} kg
            </span>
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[300px]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="fitvoraGreenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2FAF37" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#2FAF37" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {ticks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={width - paddingRight}
                y2={tick.y}
                stroke="#F0FDF4"
                strokeWidth="1.5"
              />
              <text
                x={paddingLeft - 8}
                y={tick.y + 4}
                textAnchor="end"
                className="fill-gray-400 text-[10px] font-medium"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* Baseline reference line */}
          {baselineY !== null && (
            <line
              x1={paddingLeft}
              y1={baselineY}
              x2={width - paddingRight}
              y2={baselineY}
              stroke="#9CA3AF"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
          )}

          {/* Area fill */}
          <path d={areaD} fill="url(#fitvoraGreenGrad)" />

          {/* Trendline */}
          <path
            d={pathD}
            fill="none"
            stroke="#2FAF37"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, i) => {
            const isHovered = hoveredPoint?.entry.id === pt.entry.id;
            return (
              <g key={pt.entry.id || i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  className="fill-[#075B2B] stroke-white stroke-2 cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}

          {/* X-axis dates */}
          {points.length > 0 && firstPt && lastPt && (
            <>
              <text
                x={firstPt.x}
                y={height - 10}
                textAnchor="start"
                className="fill-gray-400 text-[10px]"
              >
                {firstPt.entry.recorded_at}
              </text>
              {points.length > 2 && points[Math.floor(points.length / 2)] && (
                <text
                  x={points[Math.floor(points.length / 2)]!.x}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-gray-400 text-[10px]"
                >
                  {points[Math.floor(points.length / 2)]!.entry.recorded_at}
                </text>
              )}
              <text
                x={lastPt.x}
                y={height - 10}
                textAnchor="end"
                className="fill-gray-400 text-[10px]"
              >
                {lastPt.entry.recorded_at}
              </text>
            </>
          )}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-xl bg-[#1A2E1C] px-3 py-1.5 text-center text-xs text-white shadow-lg"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 8}%`,
            }}
          >
            <p className="font-bold">{hoveredPoint.entry.weight_kg} kg</p>
            <p className="text-[10px] text-emerald-300">
              {hoveredPoint.entry.recorded_at}
            </p>
            {hoveredPoint.entry.notes && (
              <p className="mt-0.5 max-w-[140px] truncate text-[10px] text-gray-300">
                {hoveredPoint.entry.notes}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
