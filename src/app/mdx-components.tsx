// src/app/mdx-components.tsx
import type { MDXComponents } from 'mdx/types';
import { TLDR, ProsCons, Sources, SpecTable } from '@/components/mdx/shortcodes';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    TLDR,
    ProsCons,
    Sources,
    SpecTable,
    ...components,
  };
}
