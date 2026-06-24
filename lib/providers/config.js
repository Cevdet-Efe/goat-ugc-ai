export const PROVIDERS = {
    FAL: 'fal',
    LTX: 'ltx',
    LOCAL: 'local',
};

export function resolveProvider() {
    const raw = (process.env.AI_PROVIDER || '').toLowerCase();
    if (raw === PROVIDERS.LTX) return PROVIDERS.LTX;
    if (raw === PROVIDERS.LOCAL) return PROVIDERS.LOCAL;
    if (raw === PROVIDERS.FAL) return PROVIDERS.FAL;
    if (process.env.LTX_API_KEY) return PROVIDERS.LTX;
    if (process.env.LOCAL_INFERENCE_URL) return PROVIDERS.LOCAL;
    if (process.env.FAL_KEY) return PROVIDERS.FAL;
    return PROVIDERS.LTX;
}

export function resolveVideoProvider() {
    if (process.env.LTX_API_KEY) return PROVIDERS.LTX;
    const main = resolveProvider();
    if (main === PROVIDERS.FAL && process.env.FAL_KEY) return PROVIDERS.FAL;
    return PROVIDERS.LTX;
}

export function resolveImageProvider() {
    if (process.env.FAL_KEY) return PROVIDERS.FAL;
    if (process.env.LOCAL_INFERENCE_URL) return PROVIDERS.LOCAL;
    return null;
}

export function providerLabel(id) {
    switch (id) {
        case PROVIDERS.LTX:   return 'LTX Video';
        case PROVIDERS.LOCAL:  return 'Local runtime';
        default:               return 'fal.ai';
    }
}

export function providerSummary() {
    const provider = resolveProvider();
    const videoProvider = resolveVideoProvider();
    const imageProvider = resolveImageProvider();
    return {
        provider,
        videoProvider,
        imageProvider,
        label: providerLabel(provider),
        capabilities: {
            image: imageProvider !== null,
            video: true,
            scenePlan: Boolean(process.env.FAL_KEY),
            voice: Boolean(process.env.FAL_KEY),
        },
        serverKeyConfigured: Boolean(
            process.env.LTX_API_KEY ||
            process.env.FAL_KEY ||
            (provider === PROVIDERS.LOCAL && process.env.LOCAL_INFERENCE_URL),
        ),
    };
}
