import { Suspense } from "react";
import { ListingsContent } from "./ListingsContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Student Housing — Board-inn",
  description: "Browse boarding houses and bed spaces near your university. Filter by city, price, and unit type.",
};

export default function ListingsPage() {
    return (
      <Suspense fallback={<div className="p-10 text-center text-muted-foreground uppercase tracking-widest font-bold animate-pulse">Loading Listings...</div>}>
        <ListingsContent />
      </Suspense>
    );
}
