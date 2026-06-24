import { PROVIDERS, resolveProvider, resolveVideoProvider, resolveImageProvider } from './config.js';
import * as fal from './fal.js';
import * as ltx from './ltx.js';
import * as local from './local.js';

function imageAdapterFor(provider) {
    switch (provider) {
        case PROVIDERS.FAL:   return fal;
        case PROVIDERS.LOCAL: return local;
        default: return null;
    }
}

function videoAdapterFor(provider) {
    switch (provider) {
        case PROVIDERS.LTX:  return ltx;
        case PROVIDERS.FAL:  return fal;
        default: throw new Error(`No video adapter for provider: ${provider}`);
    }
}

export async function generateImage(params) {
    const provider = resolveImageProvider();
    if (!provider) {
        throw new Error('No image provider configured. Set FAL_KEY for image generation, or use text-to-video mode.');
    }
    const adapter = imageAdapterFor(provider);
    if (!adapter || typeof adapter.generateImage !== 'function') {
        throw new Error('Active provider does not support image generation.');
    }
    return adapter.generateImage(params);
}

export async function generateVideo(params) {
    const provider = resolveVideoProvider();
    const adapter = videoAdapterFor(provider);
    if (typeof adapter.generateVideo !== 'function') {
        throw new Error('Active provider does not support video generation.');
    }
    return adapter.generateVideo(params);
}

export { PROVIDERS, resolveProvider, resolveVideoProvider };
export { FAL_IMAGE_MODELS, FAL_VIDEO_MODELS } from './fal.js';
export { LTX_VIDEO_MODELS } from './ltx.js';
