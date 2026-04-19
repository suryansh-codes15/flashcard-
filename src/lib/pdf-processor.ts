// @ts-ignore
import * as pdf from 'pdf-parse';
import type { PDFChunk } from '@/types';

interface ParsedPDF {
  text: string;
  pageCount: number;
  title?: string;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function cleanText(text: string): string {
  return text
    .replace(/\f/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Robust extraction using pdf-parse (Pure Node.js, zero workers).
 * This completely avoids the "Fake Worker" issues seen with pdfjs-dist.
 */
async function extractTextFromBuffer(buffer: Buffer): Promise<ParsedPDF> {
  try {
    const parse = (pdf as any).default || pdf;
    const data = await parse(buffer);
    
    return {
      text: data.text || '',
      pageCount: data.numpages || 0,
      title: data.info?.Title || undefined
    };
  } catch (err) {
    console.error('pdf-parse failure:', err);
    throw new Error('Failed to parse PDF content. Please ensure the file is valid.');
  }
}

function detectHeading(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.length > 80) return false;
  if (/^(Chapter|Section|Part|Module|Unit|Lesson)\s+\d+/i.test(trimmed)) return true;
  if (/^\d+\.\s+[A-Z]/.test(trimmed)) return true;
  if (/^[A-Z][A-Z\s]{4,}$/.test(trimmed)) return true;
  if (trimmed.endsWith(':') && trimmed.length < 60) return true;
  return false;
}

function splitIntoSemanticChunks(text: string, maxTokens = 2000): PDFChunk[] {
  const chunks: PDFChunk[] = [];
  const lines = text.split('\n');

  let currentChunkLines: string[] = [];
  let currentTitle: string | undefined;
  let chunkIndex = 0;

  const flushChunk = () => {
    const content = cleanText(currentChunkLines.join('\n'));
    if (content.length < 100) return;

    chunks.push({
      id: `chunk-${chunkIndex++}-${Date.now()}`,
      content,
      sectionTitle: currentTitle,
      tokenCount: estimateTokens(content),
    });
    currentChunkLines = [];
  };

  for (const line of lines) {
    const isHeading = detectHeading(line);

    if (isHeading && currentChunkLines.length > 3) {
      flushChunk();
      currentTitle = line.trim();
      continue;
    }

    if (isHeading) {
      currentTitle = line.trim();
      continue;
    }

    currentChunkLines.push(line);

    const currentTokens = estimateTokens(currentChunkLines.join('\n'));
    if (currentTokens >= maxTokens) {
      flushChunk();
    }
  }

  if (currentChunkLines.length > 0) {
    flushChunk();
  }

  const maxChunks = parseInt(process.env.MAX_PDF_CHUNKS || '15', 10);
  return chunks.slice(0, maxChunks);
}

export async function processPDF(buffer: Buffer): Promise<{
  chunks: PDFChunk[];
  pageCount: number;
  title?: string;
}> {
  const { text, pageCount, title } = await extractTextFromBuffer(buffer);
  const cleanedText = cleanText(text);
  const chunks = splitIntoSemanticChunks(cleanedText);

  return { chunks, pageCount, title };
}
