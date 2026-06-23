import React from "react";

// Individual Skeleton Elements
export const SkeletonShimmer = () => (
  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5" />
);

export const SkeletonInput = () => (
  <div className="relative overflow-hidden h-[46px] w-full rounded-xl bg-neutral-200 dark:bg-neutral-800">
    <SkeletonShimmer />
  </div>
);

export const SkeletonButton = ({ width = "w-full" }) => (
  <div className={`relative overflow-hidden h-12 ${width} rounded-xl bg-neutral-300 dark:bg-neutral-700`}>
    <SkeletonShimmer />
  </div>
);

export const SkeletonText = ({ width = "w-3/4", height = "h-4" }) => (
  <div className={`relative overflow-hidden ${height} ${width} rounded bg-neutral-200 dark:bg-neutral-800`}>
    <SkeletonShimmer />
  </div>
);

// Composite Form Skeleton Card
export const SkeletonAuthCard = () => {
  return (
    <div className="space-y-6 w-full max-w-md p-8 rounded-3xl border border-neutral-100 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md">
      <div className="space-y-3">
        <SkeletonText width="w-1/3" height="h-6" />
        <SkeletonText width="w-2/3" height="h-4" />
      </div>
      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <SkeletonText width="w-1/4" height="h-3" />
          <SkeletonInput />
        </div>
        <div className="space-y-2">
          <SkeletonText width="w-1/4" height="h-3" />
          <SkeletonInput />
        </div>
        <div className="flex justify-between items-center pt-1">
          <SkeletonText width="w-1/3" height="h-4" />
          <SkeletonText width="w-1/4" height="h-4" />
        </div>
        <SkeletonButton />
        <div className="flex gap-4 pt-2">
          <SkeletonInput />
          <SkeletonInput />
          <SkeletonInput />
        </div>
      </div>
    </div>
  );
};

// Mock Canteen Card Skeleton
export const SkeletonCanteenCard = () => {
  return (
    <div className="relative overflow-hidden flex gap-4 p-4 rounded-2xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-150 dark:border-neutral-850">
      <SkeletonShimmer />
      <div className="h-16 w-16 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />
      <div className="flex-1 space-y-2.5 py-1">
        <SkeletonText width="w-3/4" height="h-4.5" />
        <div className="flex items-center gap-3">
          <SkeletonText width="w-1/4" height="h-3.5" />
          <SkeletonText width="w-1/5" height="h-3.5" />
        </div>
      </div>
    </div>
  );
};
