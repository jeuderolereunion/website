import { Section } from '@/components/semantic/Section';

export default function AppLayoutElement({ children }: { children: React.ReactNode }) {
  return (
    <Section>
      {children}
    </Section>
  );
}
