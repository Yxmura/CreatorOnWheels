from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import asyncio
from yt_dlp import YoutubeDL
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Spotify Client
client_id = 'YOUR_SPOTIFY_CLIENT_ID'
client_secret = 'YOUR_SPOTIFY_CLIENT_SECRET'
spotify = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials(client_id, client_secret))

@app.route('/api/check_copyright', methods=['POST'])
def check_copyright():
    data = request.json
    query = data.get('query')

    # Check if it's a YouTube URL
    if 'youtube.com' in query or 'youtu.be' in query:
        return jsonify(get_youtube_info(query))
    else:
        return jsonify(search_spotify_info(query))

def get_youtube_info(url):
    with YoutubeDL({'format': 'bestaudio/best', 'quiet': True, 'verbose': True}) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
            license_info = info.get('license', 'Standard YouTube License')
            title = info.get('title', '').lower()
            description = info.get('description', '').lower()

            is_creative_commons = (
                'creative commons' in description or
                license_info.lower() == 'creative commons'
            )
            no_copyright_terms = ['no copyright', 'free to use', 'royalty-free']
            contains_no_copyright = any(term in title or term in description for term in no_copyright_terms)
            copyrighted = not (is_creative_commons or contains_no_copyright)

            return {
                'title': info.get('title', 'Unknown'),
                'is_copyrighted': copyrighted,
                'license': license_info,
                'url': url
            }
        except Exception as e:
            return {'error': str(e)}

def search_spotify_info(query):
    results = spotify.search(q=query, type='track', limit=1)
    if results['tracks']['items']:
        track = results['tracks']['items'][0]
        album = spotify.album(track['album']['id'])
        copyrighted = True

        if 'copyrights' in album:
            copyright_text = ' '.join([c['text'].lower() for c in album['copyrights']])
            if any(term in copyright_text for term in ['creative commons', 'public domain']):
                copyrighted = False

        return {
            'title': track['name'],
            'is_copyrighted': copyrighted,
            'spotify_url': track['external_urls']['spotify']
        }
    return {'error': "No information found."}

if __name__ == '__main__':
    app.run(port=5000)
