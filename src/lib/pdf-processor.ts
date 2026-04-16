/* eslint-disable @typescript-eslint/no-require-imports */
import type { PDFChunk } from '@/types';

interface ParsedPDF {
  text: string;
  pageCount: number;
  title?: string;
}

async function extractTextFromBuffer(buffer: Buffer): Promise<ParsedPDF> {
  // pdf2json uses an event-driven API — wrap it in a Promise
  const PDFParser = require('pdf2json');
  return new Promise((resolve, reject) => {
    const parser = new PDFParser(null, 1); // 1 = raw text mode

    parser.on('pdfParser_dataReady', (pdfData: Record<string, unknown>) => {
      try {
        // pdfData.Pages is defined when parsed in raw mode
        const pages = (pdfData as { Pages?: Array<{ Texts: Array<{ R: Array<{ T: string }> }> }> }).Pages ?? [];
        const textParts: string[] = [];

        for (const page of pages) {
          for (const textItem of page.Texts ?? []) {
            for (const run of textItem.R ?? []) {
              try {
                textParts.push(decodeURIComponent(run.T));
              } catch {
                textParts.push(unescape(run.T));
              }
            }
          }
          textParts.push('\n'); // paragraph break between pages
        }

        resolve({
          text: textParts.join(' '),
          pageCount: pages.length,
          title: (pdfData as { Meta?: { Title: string } }).Meta?.Title || undefined,
        });
      } catch (err) {
        reject(err);
      }
    });

    parser.on('pdfParser_dataError', (err: { parserError: Error }) => {
      reject(err.parserError ?? new Error('PDF parse error'));
    });

    parser.parseBuffer(buffer);
  });
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function cleanText(text: string): string {
  return text
    .replace(/\f/g, '\n')              // form feeds
    .replace(/[ \t]+/g, ' ')           // multiple spaces/tabs
    .replace(/\n{3,}/g, '\n\n')        // excessive newlines
    .trim();
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

function splitIntoSemanticChunks(text: string, maxTokens = 1500): PDFChunk[] {
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

  const maxChunks = parseInt(process.env.MAX_PDF_CHUNKS || '30', 10);
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
