'use client';
import dynamic from 'next/dynamic';
import type { Flashcard, CardTemplateKey } from '@/types';

// Lazy load every template for performance
const ConceptGlow    = dynamic(() => import('./ConceptGlow'));
const ComparisonSplit = dynamic(() => import('./ComparisonSplit'));
const TimelineSteps  = dynamic(() => import('./TimelineSteps'));
const FormulaDark    = dynamic(() => import('./FormulaDark'));
const QuoteHero      = dynamic(() => import('./QuoteHero'));
const ScenarioStory  = dynamic(() => import('./ScenarioStory'));
const WarningEdge    = dynamic(() => import('./WarningEdge'));
const Checklist      = dynamic(() => import('./Checklist'));
const DataTable      = dynamic(() => import('./DataTable'));
const MindMap        = dynamic(() => import('./MindMap'));
const ExamHighlight  = dynamic(() => import('./ExamHighlight'));
const MinimalDark    = dynamic(() => import('./MinimalDark'));
const MCQCard        = dynamic(() => import('./MCQCard'));

interface Props {
  card: Flashcard;
  side: 'front' | 'back';
  selectedOption?: string | null;
  onSelect?: (option: string) => void;
}

export default function TemplateRenderer({ card, side, selectedOption, onSelect }: Props) {
  const key: CardTemplateKey = card.templateKey || (card.type === 'mcq' ? 'mcq_card' : 'concept_glow');

  const props = { card, side, selectedOption, onSelect };

  switch (key) {
    case 'mcq_card':          return <MCQCard        {...props} />;
    case 'concept_glow':      return <ConceptGlow    {...props} />;
    case 'comparison_split':  return <ComparisonSplit {...props} />;
    case 'timeline_steps':    return <TimelineSteps  {...props} />;
    case 'formula_dark':      return <FormulaDark    {...props} />;
    case 'quote_hero':        return <QuoteHero      {...props} />;
    case 'scenario_story':    return <ScenarioStory  {...props} />;
    case 'warning_edge':      return <WarningEdge    {...props} />;
    case 'checklist':         return <Checklist      {...props} />;
    case 'data_table':        return <DataTable      {...props} />;
    case 'mind_map':          return <MindMap        {...props} />;
    case 'exam_highlight':    return <ExamHighlight  {...props} />;
    case 'minimal_dark':      return <MinimalDark    {...props} />;
    default:                  return <ConceptGlow    {...props} />;
  }
}
