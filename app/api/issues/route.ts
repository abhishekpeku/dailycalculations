import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { title, body, labels } = data || {};

    const repo = process.env.GITHUB_REPOSITORY || 'abhishekpeku/calcora';
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return NextResponse.json({ error: 'GITHUB_TOKEN not configured on server' }, { status: 500 });
    }

    const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, body, labels })
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }

    const issue = await res.json();
    return NextResponse.json({ url: issue.html_url }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
