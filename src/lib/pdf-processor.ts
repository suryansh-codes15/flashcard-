import PDFParser from 'pdf2json';
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
 * Rollback to pdf2json (Version 4.0.2)
 * This was the engine used when "it was working correctly".
 */
async function extractTextFromBuffer(buffer: Buffer): Promise<ParsedPDF> {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      console.error('pdf2json error:', errData.parserError);
      reject(new Error(errData.parserError || 'Failed to parse PDF Data'));
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      // Version 4.x getRawTextContent() returns the text extracted
      // based on the '1' flag in the constructor
      const text = pdfParser.getRawTextContent();
      const pageCount = pdfData.Pages ? pdfData.Pages.length : 0;
      
      resolve({
        text: text || '',
        pageCount,
        title: pdfData.Meta?.Title || undefined
      });
    });

    try {
      pdfParser.parseBuffer(buffer);
    } catch (err) {
      reject(err);
    }
  });
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
