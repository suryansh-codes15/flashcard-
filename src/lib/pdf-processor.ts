import * as pdfjs from 'pdfjs-dist';

// Use standard legacy worker for Node.js compatibility
// In Next.js/Node, we don't necessarily need a separate worker file if we use the standard setup
// but we must handle the pdfjs import carefully.

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
 * Migration: Using pdfjs-dist for robust text extraction.
 * This fixes the "PASSWORDEXCEPTION: NO PASSWORD GIVEN" issue.
 */
async function extractTextFromBuffer(buffer: Uint8Array): Promise<ParsedPDF> {
  // Load the PDF document
  const loadingTask = pdfjs.getDocument({
    data: buffer,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n\n';
  }

  // Attempt to get metadata for title
  const metadata = await pdf.getMetadata().catch(() => null);

  return {
    text: fullText,
    pageCount: numPages,
    title: (metadata?.info as any)?.Title || undefined
  };
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
