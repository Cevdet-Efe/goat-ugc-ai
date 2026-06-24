const LTX_BASE = 'https://api.ltx.video';

export const LTX_VIDEO_MODELS = [
    {
        id: 'ltx-2-3-pro',
        label: 'LTX 2.3 Pro (best quality)',
        durations: [6, 8, 10],
        resolutions: ['1920x1080', '1080x1920', '2560x1440', '1440x2560', '3840x2160', '2160x3840'],
    },
    {
        id: 'ltx-2-3-fast',
        label: 'LTX 2.3 Fast (fastest)',
        durations: [6, 8, 10, 12, 14, 16, 18, 20],
        resolutions: ['1920x1080', '1080x1920', '2560x1440', '1440x2560', '3840x2160', '2160x3840'],
    },
    {
        id: 'ltx-2-pro',
        label: 'LTX 2 Pro (quality)',
        durations: [6, 8, 10],
        resolutions: ['1920x1080', '2560x1440', '3840x2160'],
    },
    {
        id: 'ltx-2-fast',
        label: 'LTX 2 Fast (speed)',
        durations: [6, 8, 10, 12, 14, 16, 18, 20],
        resolutions: ['1920x1080', '2560x1440', '3840x2160'],
    },
];

function getApiKey() {
    const key = process.env.LTX_API_KEY;
    if (!key) throw new Error('LTX_API_KEY not set. Add it to .env.local or Vercel env.');
    return key;
}

export function findVideoModel(id) {
    return LTX_VIDEO_MODELS.find((m) => m.id === id) || LTX_VIDEO_MODELS[0];
}

export async function generateVideo(params = {}) {
    const apiKey = getApiKey();
    const model = findVideoModel(params.model);
    const isI2V = !!params.image_url;
    const endpoint = isI2V ? 'image-to-video' : 'text-to-video';

    const rawDuration = Number(params.duration) || 6;
    const maxDur = model.durations[model.durations.length - 1] || 20;
    const duration = Math.max(6, Math.min(maxDur, rawDuration));

    const defaultRes = model.resolutions[0] || '1920x1080';
    const resolution = (params.resolution && model.resolutions.includes(params.resolution))
        ? params.resolution
        : defaultRes;

    const body = {
        prompt: params.prompt,
        model: model.id,
        duration,
        resolution,
        generate_audio: false,
    };
    if (isI2V) body.image_uri = params.image_url;

    const response = await fetch(`${LTX_BASE}/v1/${endpoint}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        let msg = `LTX generation failed (${response.status})`;
        try {
            const err = await response.json();
            msg = err?.error?.message || err?.error?.type || msg;
        } catch { /* binary error body, use default msg */ }
        const error = new Error(msg);
        error.status = response.status;
        throw error;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return {
        provider: 'ltx',
        model: model.id,
        endpoint: `v1/${endpoint}`,
        buffer,
    };
}
