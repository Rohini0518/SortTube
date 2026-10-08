// Landing page FAQ (app/page.tsx). Content lives in lib/landing/content.ts.

import { FAQ_ITEMS } from "@/lib/landing/content";

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center font-heading text-3xl font-extrabold text-foreground lg:text-4xl">
          Questions worth answering upfront
        </h2>
        <div className="mt-10 space-y-5">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question} className="rounded-2xl border-2 border-foreground bg-card p-5">
              <p className="font-heading text-base font-extrabold text-foreground">{item.question}</p>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
