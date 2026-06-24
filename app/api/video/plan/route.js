import { NextResponse } from 'next/server';
import { planVideoScenes as planWithLLM } from '@/lib/providers/fal-llm.js';
import { planVideoScenes as planWithTemplate } from '@/lib/providers/simple-planner.js';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request) {
    try {
        const body = await request.json();
        if (!body.topic || typeof body.topic !== 'string' || body.topic.trim().length < 3) {
            return NextResponse.json({ error: 'topic is required (min 3 chars)' }, { status: 400 });
        }

        const planOpts = {
            topic: body.topic.trim(),
            tone: body.tone,
            audience: body.audience,
            durationSec: Number(body.durationSec) || 30,
            style: body.style,
            useVideoClips: Boolean(body.useVideoClips),
            sceneCount: Number(body.sceneCount) || undefined,
            clipDuration: Number(body.clipDuration) || undefined,
        };

        let plan;
        if (process.env.FAL_KEY) {
            plan = await planWithLLM(planOpts);
        } else {
            plan = planWithTemplate(planOpts);
        }

        return NextResponse.json(plan);
    } catch (error) {
        console.error('[api/video/plan]', error);
        return NextResponse.json({ error: error.message || 'Scene planning failed' }, { status: 500 });
    }
}
