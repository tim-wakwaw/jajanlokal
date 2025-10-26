"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Cell = {
  id: string;
  row: number;
  col: number;
  rippling: boolean;
};

export const BackgroundRippleEffect = ({
  className,
  gridSize = 50,
}: {
  className?: string;
  gridSize?: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cells, setCells] = useState<Cell[]>([]);
  const [dimensions, setDimensions] = useState({ rows: 0, cols: 0 });

  // Initialize grid
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const cols = Math.ceil(width / gridSize);
      const rows = Math.ceil(height / gridSize);

      setDimensions({ rows, cols });

      const newCells: Cell[] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          newCells.push({
            id: `${row}-${col}`,
            row,
            col,
            rippling: false,
          });
        }
      }
      setCells(newCells);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [gridSize]);

  const triggerRipple = useCallback(
    (row: number, col: number) => {
      setCells((prevCells) =>
        prevCells.map((cell) =>
          cell.row === row && cell.col === col
            ? { ...cell, rippling: true }
            : cell
        )
      );

      // Reset rippling state after animation
      setTimeout(() => {
        setCells((prevCells) =>
          prevCells.map((cell) =>
            cell.row === row && cell.col === col
              ? { ...cell, rippling: false }
              : cell
          )
        );
      }, 400);

      // Trigger adjacent cells with delay
      const delays = [50, 100, 150];
      const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ];

      directions.forEach((dir, index) => {
        const newRow = row + dir[0];
        const newCol = col + dir[1];
        const delay = delays[Math.floor(index / 3)] || 150;

        setTimeout(() => {
          if (
            newRow >= 0 &&
            newRow < dimensions.rows &&
            newCol >= 0 &&
            newCol < dimensions.cols
          ) {
            setCells((prevCells) =>
              prevCells.map((cell) =>
                cell.row === newRow && cell.col === newCol
                  ? { ...cell, rippling: true }
                  : cell
              )
            );

            setTimeout(() => {
              setCells((prevCells) =>
                prevCells.map((cell) =>
                  cell.row === newRow && cell.col === newCol
                    ? { ...cell, rippling: false }
                    : cell
                )
              );
            }, 400);
          }
        }, delay);
      });
    },
    [dimensions]
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 grid",
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${dimensions.cols}, ${gridSize}px)`,
        gridTemplateRows: `repeat(${dimensions.rows}, ${gridSize}px)`,
      }}
    >
      {cells.map((cell) => (
        <div
          key={cell.id}
          className={cn(
            "border-[0.5px] border-neutral-200 bg-neutral-50 transition-all dark:border-neutral-800 dark:bg-neutral-950",
            cell.rippling && "animate-cell-ripple bg-blue-100 dark:bg-blue-950"
          )}
          onClick={() => triggerRipple(cell.row, cell.col)}
          onMouseEnter={(e) => {
            if (e.buttons === 1) {
              // If mouse is pressed while hovering
              triggerRipple(cell.row, cell.col);
            }
          }}
          style={{
            animationDelay: cell.rippling ? "0ms" : undefined,
          }}
        />
      ))}
    </div>
  );
};

export function BackgroundRippleEffectDemo() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-start justify-start overflow-hidden">
      <BackgroundRippleEffect />
      <div className="mt-60 w-full">
        <h2 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-neutral-800 md:text-4xl lg:text-7xl dark:text-neutral-100">
          Interactive Background Boxes Ripple Effect
        </h2>
        <p className="relative z-10 mx-auto mt-4 max-w-xl text-center text-neutral-800 dark:text-neutral-500">
          Hover over the boxes above and click. To be used on backgrounds of hero
          sections OR Call to Action sections. I beg you don&apos;t use it
          everywhere.
        </p>
      </div>
    </div>
  );
}

