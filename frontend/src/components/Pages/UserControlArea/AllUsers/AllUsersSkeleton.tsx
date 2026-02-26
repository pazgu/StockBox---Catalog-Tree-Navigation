import React from "react";
import { Skeleton } from "../../../ui/skeleton";

type Props = { count?: number };

const UserCardSkeleton = () => {
  return (
    <div className="rounded-xl p-4 text-center shadow-sm relative min-h-[110px] bg-[#fffdf8] border border-gray-100">
      {/* top left pill */}
      <Skeleton className="absolute top-2 left-2 h-6 w-24 rounded-full" />

      {/* top right icons */}
      <div className="absolute top-2 right-2 flex gap-2">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>

      {/* avatar */}
      <Skeleton className="w-10 h-10 rounded-full mx-auto mb-2" />

      {/* text lines */}
      <Skeleton className="h-3 w-14 mx-auto mb-2 rounded" />
      <Skeleton className="h-4 w-24 mx-auto mb-2 rounded" />
      <Skeleton className="h-3 w-32 mx-auto mb-3 rounded" />

      {/* role pill */}
      <Skeleton className="h-6 w-20 mx-auto rounded-full" />
    </div>
  );
};

const AllUsersSkeleton: React.FC<Props> = ({ count = 8 }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default AllUsersSkeleton;