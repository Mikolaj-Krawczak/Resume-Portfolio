/**
 * Jedna lista sekcji portfolio: ten sam slug na stronie głównej (kotwice) i w routingu /resume/[section].
 */
export const SECTION_SLUGS = ['experience', 'education', 'projects', 'about'] as const;

export type SectionSlug = (typeof SECTION_SLUGS)[number];

export const SECTION_LABELS: Record<SectionSlug, string> = {
	experience: 'Experience',
	education: 'Education & courses',
	projects: 'Projects',
	about: 'About me',
};

export function isSectionSlug(value: string): value is SectionSlug {
	return (SECTION_SLUGS as readonly string[]).includes(value);
}
