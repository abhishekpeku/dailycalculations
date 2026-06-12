import { NextResponse } from 'next/server';

const content = `User-agent: *
Allow: /
Sitemap: https://dailycalculations.app/sitemap.xml
`; 

export function GET() {
  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8'
    }
  });
}
