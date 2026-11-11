import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

import { skeletonPillars } from "../data";

export function WelcomeHero() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-20">
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-4xl font-bold tracking-tight">{siteConfig.name}</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{siteConfig.description}</p>
        <div className="flex gap-3">
          {/* Link trông như Button: dùng buttonVariants, không lồng <a> trong <button> */}
          <Link href="/api/health" className={buttonVariants({ size: "lg" })}>
            Kiểm tra /api/health
          </Link>
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Next.js Docs
          </a>
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-3">
        {skeletonPillars.map((pillar) => (
          <li key={pillar.title} className="rounded-lg border bg-card p-5">
            <h2 className="font-semibold">{pillar.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{pillar.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
