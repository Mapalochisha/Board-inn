import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-12 pb-24">
      {/* Gallery Skeleton */}
      <Skeleton className="aspect-video w-full rounded-2xl" />

      {/* Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>

      {/* Amenities Skeleton */}
      <section>
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>
      </section>

      {/* Units Skeleton */}
      <section>
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </section>

      {/* Booking Skeleton */}
      <section>
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </section>
    </main>
  );
}
