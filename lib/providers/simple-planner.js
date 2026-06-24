import { CAMERA_MOVES, LIGHTING_LOOKS, FILM_LOOKS, NEGATIVE_TAILS } from '../prompt-library.js';

const STORY_BEATS = [
    { phase: 'Hook',       verb: 'reveals',    framing: 'wide establishing shot' },
    { phase: 'Context',    verb: 'pans across', framing: 'slow pan right' },
    { phase: 'Problem',    verb: 'focuses on',  framing: 'close-up' },
    { phase: 'Transition', verb: 'pulls back',  framing: 'dolly-out' },
    { phase: 'Solution',   verb: 'tracks into', framing: 'medium shot, dolly-in' },
    { phase: 'Detail',     verb: 'lingers on',  framing: 'macro close-up' },
    { phase: 'Proof',      verb: 'shows',       framing: 'over-the-shoulder' },
    { phase: 'Emotion',    verb: 'captures',    framing: 'shallow depth of field portrait' },
    { phase: 'Momentum',   verb: 'sweeps across', framing: 'tracking shot' },
    { phase: 'CTA',        verb: 'lands on',    framing: 'centered lock-off' },
];

const ANIMATIONS = ['slowZoomIn', 'slowZoomOut', 'panRight', 'panLeft', 'breathing', 'static'];

function pick(arr, idx) {
    return arr[idx % arr.length];
}

export function planVideoScenes(opts = {}) {
    const {
        topic,
        tone = 'cinematic',
        sceneCount: requestedCount,
        clipDuration = 6,
    } = opts;

    const sceneCount = Number.isFinite(requestedCount)
        ? Math.max(3, Math.min(30, Math.round(requestedCount)))
        : 6;

    const perScene = Math.max(6, Math.min(20, Math.round(clipDuration)));

    const scenes = [];
    for (let i = 0; i < sceneCount; i++) {
        const beat = pick(STORY_BEATS, i);
        const camera = pick(CAMERA_MOVES, i);
        const lighting = pick(LIGHTING_LOOKS, i);
        const film = pick(FILM_LOOKS, i);
        const negative = pick(NEGATIVE_TAILS, i);

        const imagePrompt = [
            `${beat.framing} of ${topic},`,
            `${lighting.phrase},`,
            `${film.phrase},`,
            `${tone} mood, professional composition.`,
            negative,
        ].join(' ');

        const videoPrompt = [
            `${camera.phrase}, subtle natural motion,`,
            `${tone} pacing, smooth continuous movement.`,
            negative,
        ].join(' ');

        scenes.push({
            id: i + 1,
            duration: perScene,
            imagePrompt,
            videoPrompt,
            voiceText: '',
            subtitle: `Scene ${i + 1}: ${beat.phase}`,
            animation: pick(ANIMATIONS, i),
        });
    }

    const title = topic.length > 60 ? topic.slice(0, 57) + '...' : topic;

    return {
        title,
        hook: `A ${tone} look at ${topic}`,
        style: `${tone} product commercial`,
        musicPrompt: `${tone} background music, modern, clean`,
        scenes,
    };
}
