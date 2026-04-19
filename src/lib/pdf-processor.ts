const PDFParser = require("pdf2json");
const fs = require("fs");
const path = require("path");

interface ParsedPDF {
  text: string;
  pageCount: number;
  title?: string;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\f/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * The Ultimate Fix: Using pdf2json (Professional grade, Vercel whitelisted).
 * This library is much more robust than pdf-parse for complex PDF buffers.
 */
async function extractTextFromBuffer(buffer: Buffer): Promise<ParsedPDF> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1); // 1 = text only mode

    pdfParser.on("pdfParser_dataError", errData => {
      console.error('pdf2json error:', errData.parserError);
      reject(new Error('PDF extraction failed. The file might be corrupted or protected.'));
    });

    pdfParser.on("pdfParser_dataReady", pdfData => {
      try {
        // Robust manual extraction loop
        let text = "";
        if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
          pdfData.Pages.forEach((page: any) => {
            if (page.Texts && Array.isArray(page.Texts)) {
              page.Texts.forEach((t: any) => {
                if (t.R && t.R[0] && t.R[0].T) {
                  text += decodeURIComponent(t.R[0].T) + " ";
                }
              });
            }
            text += "\n";
          });
        }

        // Fallback to getRawTextContent if manual extraction yields little
        if (text.trim().length < 50) {
          text = pdfParser.getRawTextContent() || text;
        }

        resolve({
          text: text || '',
          pageCount: pdfData.Pages?.length || 0,
          title: pdfData.Meta?.Title || undefined
        });
      } catch (err) {
        reject(err);
      }
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

function splitIntoSemanticChunks(text: string, maxTokens = 2000): any[] {
  const chunks: any[] = [];
  const lines = text.split('\n');

  let currentChunkLines: string[] = [];
  let currentTitle: string | undefined;
  let chunkIndex = 0;

  const flushChunk = () => {
    const content = cleanText(currentChunkLines.join('\n'));
    if (!content || content.length < 40) return;

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
  chunks: any[];
  pageCount: number;
  title?: string;
}> {
  const { text, pageCount, title } = await extractTextFromBuffer(buffer);
  
  // EMERGENCY TRACE: Save to disk for AI assistant to inspect
  try {
    fs.writeFileSync(path.join(process.cwd(), 'debug_pdf_text.txt'), text);
    console.log(`[DEBUG] Saved ${text.length} chars to debug_pdf_text.txt`);
  } catch (err) {
    console.error('[DEBUG] Failed to save debug text:', err);
  }

  const cleanedText = cleanText(text);
  // Use smaller 1000-token chunks to stay under Groq free-tier TPM limits
  const chunks = splitIntoSemanticChunks(cleanedText, 1000);

  return { chunks, pageCount, title };
}
