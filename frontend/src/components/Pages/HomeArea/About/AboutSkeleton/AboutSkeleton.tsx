import React from "react";
import { Skeleton } from "../../../../ui/skeleton";


const AboutSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto flex items-start gap-15 py-10 flex-wrap lg:flex-nowrap">
      {/* Right side – content */}
      <div className="flex-1 p-5 lg:ml-[400px] order-2 lg:order-1">
        {/* Title */}
        <Skeleton className="h-12 w-[360px] mx-auto rounded-xl mb-6" />

        {/* Intro card */}
        <div className="relative bg-white/60 backdrop-blur-[20px] px-9 py-8 my-4 mb-6 border border-white/30 rounded-[20px]">
          <div className="space-y-4">
            <Skeleton className="h-5 w-full rounded-lg" />
            <Skeleton className="h-5 w-[95%] rounded-lg" />
            <Skeleton className="h-5 w-[90%] rounded-lg" />
            <Skeleton className="h-5 w-[75%] rounded-lg" />
          </div>
        </div>

        {/* Fake feature cards */}
        <div className="mt-10">
          <Skeleton className="h-8 w-[240px] rounded-lg mb-5" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 my-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="relative bg-white/90 rounded-[14px] p-5 flex items-start gap-3.5 border border-stockblue/8"
              >
                <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-[60%] rounded-lg" />
                  <Skeleton className="h-4 w-full rounded-lg" />
                  <Skeleton className="h-4 w-[90%] rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex justify-center my-10">
          <Skeleton className="h-14 w-[330px] rounded-2xl" />
        </div>
      </div>

      {/* Left image panel */}
      <aside className="flex-[0_0_320px] flex justify-center items-start lg:fixed lg:top-[164px] lg:left-5 z-10 order-1 lg:order-2 mb-24">
        <Skeleton className="w-[300px] h-[400px] rounded-[3rem]" />
      </aside>
    </div>
  );
};

export default AboutSkeleton;
