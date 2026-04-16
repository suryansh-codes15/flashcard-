import { NextRequest, NextResponse } from 'next/server';
import { processPDF } from '@/lib/pdf-processor';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 20MB' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
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
      fileName: file.name,
    });
  } catch (err) {
    console.error('PDF upload error:', err);
    return NextResponse.json({ error: 'Failed to process PDF. Please try again.' }, { status: 500 });
  }
}
