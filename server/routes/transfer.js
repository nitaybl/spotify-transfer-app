const express = require('express');
const axios = require('axios');
const router = express.Router();

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// Helper function to wait/sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to make Spotify API requests
const spotifyRequest = async (endpoint, token, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      url: `${SPOTIFY_API_BASE}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// Helper to get all items with pagination
const getAllItems = async (endpoint, token) => {
  let allItems = [];
  let nextUrl = `${SPOTIFY_API_BASE}${endpoint}`;

  while (nextUrl) {
    try {
      const response = await axios.get(nextUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      allItems = allItems.concat(response.data.items);
      nextUrl = response.data.next;
    } catch (error) {
      console.error('Error fetching items:', error.response?.data || error.message);
      throw error;
    }
  }

  return allItems;
};

// Get user profile
router.post('/profile', async (req, res) => {
  const { token } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    const profile = await spotifyRequest('/me', token);
    res.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error.response?.status, error.response?.data);
    res.status(error.response?.status || 400).json({ 
      error: 'Failed to fetch profile',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Get all liked songs
router.post('/liked-songs', async (req, res) => {
  const { token } = req.body;

  try {
    const tracks = await getAllItems('/me/tracks?limit=50', token);
    res.json({ tracks });
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch liked songs' });
  }
});

// Get all playlists
router.post('/playlists', async (req, res) => {
  const { token } = req.body;

  try {
    const playlists = await getAllItems('/me/playlists?limit=50', token);
    
    // Get tracks for each playlist
    const playlistsWithTracks = await Promise.all(
      playlists.map(async (playlist) => {
        const tracks = await getAllItems(`/playlists/${playlist.id}/tracks?limit=100`, token);
        return {
          ...playlist,
          tracks: tracks
        };
      })
    );

    res.json({ playlists: playlistsWithTracks });
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch playlists' });
  }
});

// Get all followed artists
router.post('/followed-artists', async (req, res) => {
  const { token } = req.body;

  try {
    let allArtists = [];
    let after = null;

    while (true) {
      const endpoint = after 
        ? `/me/following?type=artist&limit=50&after=${after}`
        : '/me/following?type=artist&limit=50';
      
      const response = await spotifyRequest(endpoint, token);
      
      allArtists = allArtists.concat(response.artists.items);
      
      if (!response.artists.next) break;
      after = response.artists.cursors?.after;
      if (!after) break;
    }

    res.json({ artists: allArtists });
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch followed artists' });
  }
});

// Transfer liked songs
router.post('/transfer-liked-songs', async (req, res) => {
  const { targetToken, trackIds } = req.body;

  try {
    // Spotify API allows adding up to 50 tracks at a time
    const batchSize = 50;
    let transferred = 0;

    for (let i = 0; i < trackIds.length; i += batchSize) {
      const batch = trackIds.slice(i, i + batchSize);
      await spotifyRequest(
        `/me/tracks?ids=${batch.join(',')}`,
        targetToken,
        'PUT'
      );
      transferred += batch.length;
      
      // FIXED: Add a small delay between batches.
      // This forces Spotify to register distinct timestamps for each batch,
      // preserving the order of addition in the user's library.
      await sleep(100); 
    }

    res.json({ success: true, transferred });
  } catch (error) {
    res.status(400).json({ error: 'Failed to transfer liked songs' });
  }
});

// Transfer playlists
router.post('/transfer-playlists', async (req, res) => {
  const { targetToken, targetUserId, playlists } = req.body;

  try {
    const transferredPlaylists = [];

    for (const playlist of playlists) {
      // Skip playlists owned by Spotify
      if (playlist.owner.id === 'spotify') continue;

      // Create new playlist
      const newPlaylist = await spotifyRequest(
        `/users/${targetUserId}/playlists`,
        targetToken,
        'POST',
        {
          name: playlist.name,
          description: playlist.description || '',
          public: playlist.public
        }
      );

      // Add tracks to the new playlist (max 100 at a time)
      const trackUris = playlist.tracks
        .filter(item => item.track && item.track.uri)
        .map(item => item.track.uri);

      if (trackUris.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < trackUris.length; i += batchSize) {
          const batch = trackUris.slice(i, i + batchSize);
          await spotifyRequest(
            `/playlists/${newPlaylist.id}/tracks`,
            targetToken,
            'POST',
            { uris: batch }
          );
        }
      }

      transferredPlaylists.push(newPlaylist);
    }

    res.json({ success: true, playlists: transferredPlaylists });
  } catch (error) {
    console.error('Playlist transfer error:', error.response?.data || error.message);
    res.status(400).json({ error: 'Failed to transfer playlists' });
  }
});

// Transfer followed artists
router.post('/transfer-followed-artists', async (req, res) => {
  const { targetToken, artistIds } = req.body;

  try {
    // Spotify API allows following up to 50 artists at a time
    const batchSize = 50;
    let transferred = 0;

    for (let i = 0; i < artistIds.length; i += batchSize) {
      const batch = artistIds.slice(i, i + batchSize);
      await spotifyRequest(
        `/me/following?type=artist&ids=${batch.join(',')}`,
        targetToken,
        'PUT'
      );
      transferred += batch.length;
    }

    res.json({ success: true, transferred });
  } catch (error) {
    res.status(400).json({ error: 'Failed to transfer followed artists' });
  }
});

// ===== DELETION ENDPOINTS (Easter Egg Feature) =====

// Delete all liked songs
router.post('/delete-liked-songs', async (req, res) => {
  const { token } = req.body;

  try {
    // Get all liked songs
    const tracks = await getAllItems('/me/tracks?limit=50', token);
    
    if (tracks.length === 0) {
      return res.json({ success: true, deleted: 0 });
    }

    // Delete in batches of 50
    const batchSize = 50;
    let deleted = 0;

    for (let i = 0; i < tracks.length; i += batchSize) {
      const batch = tracks.slice(i, i + batchSize);
      const trackIds = batch.map(item => item.track.id);
      
      await spotifyRequest(
        `/me/tracks?ids=${trackIds.join(',')}`,
        token,
        'DELETE'
      );
      deleted += trackIds.length;
    }

    res.json({ success: true, deleted });
  } catch (error) {
    console.error('Delete liked songs error:', error.response?.data || error.message);
    res.status(400).json({ error: 'Failed to delete liked songs' });
  }
});

// Delete all playlists (only user-owned playlists)
router.post('/delete-playlists', async (req, res) => {
  const { token } = req.body;

  try {
    // Get all playlists
    const playlists = await getAllItems('/me/playlists?limit=50', token);
    
    // Get user profile to check ownership
    const profile = await spotifyRequest('/me', token);
    
    let deleted = 0;

    for (const playlist of playlists) {
      // Only delete playlists owned by the user (not followed playlists)
      if (playlist.owner.id === profile.id) {
        try {
          await spotifyRequest(
            `/playlists/${playlist.id}/followers`,
            token,
            'DELETE'
          );
          deleted++;
        } catch (error) {
          console.error(`Failed to delete playlist ${playlist.id}:`, error.message);
          // Continue deleting other playlists even if one fails
        }
      }
    }

    res.json({ success: true, deleted });
  } catch (error) {
    console.error('Delete playlists error:', error.response?.data || error.message);
    res.status(400).json({ error: 'Failed to delete playlists' });
  }
});

// Unfollow all artists
router.post('/delete-followed-artists', async (req, res) => {
  const { token } = req.body;

  try {
    // Get all followed artists
    let allArtists = [];
    let after = null;

    while (true) {
      const endpoint = after 
        ? `/me/following?type=artist&limit=50&after=${after}`
        : '/me/following?type=artist&limit=50';
      
      const response = await spotifyRequest(endpoint, token);
      
      allArtists = allArtists.concat(response.artists.items);
      
      if (!response.artists.next) break;
      after = response.artists.cursors?.after;
      if (!after) break;
    }

    if (allArtists.length === 0) {
      return res.json({ success: true, deleted: 0 });
    }

    // Unfollow in batches of 50
    const batchSize = 50;
    let deleted = 0;

    for (let i = 0; i < allArtists.length; i += batchSize) {
      const batch = allArtists.slice(i, i + batchSize);
      const artistIds = batch.map(artist => artist.id);
      
      await spotifyRequest(
        `/me/following?type=artist&ids=${artistIds.join(',')}`,
        token,
        'DELETE'
      );
      deleted += artistIds.length;
    }

    res.json({ success: true, deleted });
  } catch (error) {
    console.error('Delete followed artists error:', error.response?.data || error.message);
    res.status(400).json({ error: 'Failed to unfollow artists' });
  }
});

module.exports = router;
