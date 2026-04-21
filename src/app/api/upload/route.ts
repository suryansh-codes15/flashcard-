import { NextRequest, NextResponse } from 'next/server';
import { processPDF } from '@/lib/pdf-processor';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    let buffer: Buffer;
    let fileName: string;
    let fileSize: number;

    const contentType = request.headers.get('content-type') || '';

    // CASE 1: Cloud-Stored File (JSON with URL)
    if (contentType.includes('application/json')) {
      const { fileUrl, name } = await request.json();
      if (!fileUrl) return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
      
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Failed to fetch file from cloud storage');
      
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      fileName = name || 'cloud-document.pdf';
      fileSize = buffer.length;
    } 
    // CASE 2: Direct Upload (FormData)
    else {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      if (!file.name.toLowerCase().endsWith('.pdf')) {
        return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
      }

      buffer = Buffer.from(await file.arrayBuffer());
      fileName = file.name;
      fileSize = file.size;
    }

    // ENFORCE 4MB LIMIT
    const maxSize = 4 * 1024 * 1024; // 4MB
    if (fileSize > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 4MB' }, { status: 400 });
    }

    const { chunks, pageCount, title } = await processPDF(buffer);

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'No readable text found. Please ensure your PDF is not image-based.' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      chunks,
      pageCount,
      title,
      fileName: fileName,
    });
  } catch (err) {
    console.error('PDF upload error:', err);
    const message = err instanceof Error ? err.message : 'Failed to process PDF. Please try again.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
