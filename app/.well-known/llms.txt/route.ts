import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const llmsPath = path.join(process.cwd(), 'public', 'llms.txt')
  
  try {
    const content = fs.readFileSync(llmsPath, 'utf-8')
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
