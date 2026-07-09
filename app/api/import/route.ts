import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Forward the multipart form data to the actual backend
    const response = await fetch('http://127.0.0.1:3001/api/import', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      // If the backend returned a non-200, try to parse JSON error or return raw text
      try {
        const errorData = await response.json();
        return NextResponse.json(errorData, { status: response.status });
      } catch {
        return NextResponse.json(
          { success: false, error: response.statusText },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy route handler error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error while proxying to backend' },
      { status: 500 }
    );
  }
}
