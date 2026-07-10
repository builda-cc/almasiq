import { useEffect, useRef, useState } from 'react';
import { SearchHero } from '../components/home/SearchHero';
import { ListingsGrid } from '../components/home/ListingsGrid';
import { AIHighlights } from '../components/home/AIHighlights';
import { HowItWorks } from '../components/home/HowItWorks';
import { CallToAction } from '../components/home/CallToAction';

function useReveal<T extends HTMLElement>() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [visible, setVisible] = useState(false);

  const ref = (node: T | null) => {
    observerRef.current?.disconnect();
    if (!node || visible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    observerRef.current = observer;
  };

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return { ref, className: `reveal ${visible ? 'reveal-visible' : ''}` };
}

export function Home() {
  const listings = useReveal<HTMLDivElement>();
  const highlights = useReveal<HTMLDivElement>();

  return (
    <>
      <SearchHero />
      <ListingsGrid revealRef={listings.ref} revealClass={listings.className} />
      <AIHighlights revealRef={highlights.ref} revealClass={highlights.className} />
      <HowItWorks />
      <CallToAction />
    </>
  );
}
