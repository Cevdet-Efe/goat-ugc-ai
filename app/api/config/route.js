import { NextResponse } from 'next/server';
import { providerSummary, resolveVideoProvider, resolveImageProvider, PROVIDERS } from '@/lib/providers/config.js';
import { FAL_IMAGE_MODELS } from '@/lib/providers/fal.js';
import { LTX_VIDEO_MODELS } from '@/lib/providers/ltx.js';

export const dynamic = 'force-dynamic';

export async function GET() {
    const summary = providerSummary();
    const videoProvider = resolveVideoProvider();
    const imageProvider = resolveImageProvider();

    let imageModels = [];
    if (imageProvider === PROVIDERS.FAL) {
        imageModels = FAL_IMAGE_MODELS.map(({ id, label }) => ({ id, label }));
    }

    let videoModels = [];
    if (videoProvider === PROVIDERS.LTX) {
        videoModels = LTX_VIDEO_MODELS.map(({ id, label }) => ({ id, label }));
    }

    return NextResponse.json({
        ...summary,
        models: { image: imageModels, video: videoModels },
    });
}
