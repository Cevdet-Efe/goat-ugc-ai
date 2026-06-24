import { NextResponse } from 'next/server';
import { generateVideo } from '@/lib/providers/index.js';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request) {
    try {
        const body = await request.json();
        if (!body.prompt || typeof body.prompt !== 'string') {
            return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
        }
        const result = await generateVideo(body);

        if (result.buffer) {
            return new Response(result.buffer, {
                status: 200,
                headers: {
                    'Content-Type': 'video/mp4',
                    'X-Provider': result.provider || 'ltx',
                    'X-Model': result.model || '',
                },
            });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('[api/generate/video]', error);

        const detail = error?.body?.detail?.[0];
        if (detail?.type === 'content_policy_violation') {
            return NextResponse.json({
                error: 'content_policy_violation',
                message: 'The model refused this content. Try rephrasing the prompt or using a different subject.',
                field: Array.isArray(detail.loc) ? detail.loc.join('.') : null,
            }, { status: 422 });
        }

        return NextResponse.json({
            error: error.message || 'Generation failed',
            name: error.name,
            status: error.status,
            fieldDetail: detail?.msg || null,
        }, { status: error.status || 500 });
    }
}
