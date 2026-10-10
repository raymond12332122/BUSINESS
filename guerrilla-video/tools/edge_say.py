"""Synthesize one line with a Microsoft neural voice (edge-tts) and save word timings.

Usage: python3 tools/edge_say.py VOICE RATE "text" out.mp3   (writes out.mp3 and out.words.json)
"""
import asyncio, json, os, ssl, sys
import edge_tts
import edge_tts.communicate as comm

CA = '/root/.ccr/ca-bundle.crt'  # outbound HTTPS here goes through a proxy with its own CA
if os.path.exists(CA):
    comm._SSL_CTX = ssl.create_default_context(cafile=CA)


async def main(voice, rate, text, out):
    c = edge_tts.Communicate(text, voice, rate=rate, boundary='WordBoundary')
    words = []
    with open(out, 'wb') as f:
        async for ch in c.stream():
            if ch['type'] == 'audio': f.write(ch['data'])
            elif ch['type'] == 'WordBoundary':
                words.append({'w': ch['text'], 't0': ch['offset'] / 1e7, 't1': (ch['offset'] + ch['duration']) / 1e7})
    json.dump(words, open(out.rsplit('.', 1)[0] + '.words.json', 'w'), ensure_ascii=False)

asyncio.run(main(*sys.argv[1:5]))
