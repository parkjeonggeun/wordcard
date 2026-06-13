import { NextRequest, NextResponse } from 'next/server';

// ElevenLabs voice ID — "Aria": clear, warm American English
// Change to any voice ID from elevenlabs.io/voice-library
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? '9BWtsMINqrJLrRacOk9x';
const MODEL_ID = 'eleven_turbo_v2_5'; // fastest, lowest latency

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text');
  if (!text) {
    return NextResponse.json({ error: 'text param required' }, { status: 400 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ELEVENLABS_API_KEY not set' }, { status: 503 });
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.75,        // 안정적이고 일관된 발음
          similarity_boost: 0.85, // 원래 목소리에 충실
          style: 0.3,             // 약간의 표현력
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    console.error('ElevenLabs error:', res.status, body);
    return NextResponse.json({ error: 'ElevenLabs API error' }, { status: 502 });
  }

  const audio = await res.arrayBuffer();

  // Cache on Vercel CDN — vocabulary is fixed, so cache forever (1 year)
  return new NextResponse(audio, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
