import { SiteNav } from "@/components/site-nav";
import { Hero } from "@/components/hero";
import { ProductGrid } from "@/components/product-grid";
import { ValueProps } from "@/components/value-props";
import { SellerCta } from "@/components/seller-cta";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-grove-base">
      <SiteNav />
      <div className="flex-1 flex flex-col">
        <Hero />
        <ProductGrid />
        <ValueProps />
        <SellerCta />
      </div>
      <SiteFooter />
    </main>
  );
}
