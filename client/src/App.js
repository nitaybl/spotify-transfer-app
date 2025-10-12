import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import axios from 'axios';

// API URL - uses environment variable in production, localhost in development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8888';

function App() {
  const [sourceAccount, setSourceAccount] = useState(null);
  const [targetAccount, setTargetAccount] = useState(null);
  const [transferring, setTransferring] = useState(false);
  const [progress, setProgress] = useState({ step: '', percentage: 0 });
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    // Check for tokens in URL after OAuth redirect
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const error = params.get('error');

    if (accessToken) {
      // Determine if this is source or target account
      if (!sourceAccount) {
        setSourceAccount({ accessToken, refreshToken });
      } else if (!targetAccount) {
        setTargetAccount({ accessToken, refreshToken });
      }
      // Clean URL
      window.history.replaceState({}, document.title, '/');
    }

    if (error) {
      alert('Authentication failed. Please try again.');
      window.history.replaceState({}, document.title, '/');
    }
  }, [sourceAccount, targetAccount]);

  const handleLogin = (accountType) => {
    window.location.href = `${API_URL}/auth/login`;
  };

  const handleLogout = (accountType) => {
    if (accountType === 'source') {
      setSourceAccount(null);
    } else {
      setTargetAccount(null);
    }
    setComplete(false);
  };

  const startTransfer = async () => {
    if (!sourceAccount || !targetAccount) {
      alert('Please connect both accounts first!');
      return;
    }

    setTransferring(true);
    setComplete(false);

    try {
      // Get source account profile
      setProgress({ step: 'Fetching your profile...', percentage: 10 });
      const sourceProfile = await axios.post(`${API_URL}/transfer/profile`, {
        token: sourceAccount.accessToken
      });

      // Get target account profile
      const targetProfile = await axios.post(`${API_URL}/transfer/profile`, {
        token: targetAccount.accessToken
      });

      // Get liked songs
      setProgress({ step: 'Loading your liked songs...', percentage: 20 });
      const likedSongsResponse = await axios.post(`${API_URL}/transfer/liked-songs`, {
        token: sourceAccount.accessToken
      });
      const likedTracks = likedSongsResponse.data.tracks;

      // Transfer liked songs
      if (likedTracks.length > 0) {
        setProgress({ step: `Transferring ${likedTracks.length} liked songs...`, percentage: 35 });
        const trackIds = likedTracks.map(item => item.track.id);
        await axios.post(`${API_URL}/transfer/transfer-liked-songs`, {
          targetToken: targetAccount.accessToken,
          trackIds
        });
      }

      // Get playlists
      setProgress({ step: 'Loading your playlists...', percentage: 50 });
      const playlistsResponse = await axios.post(`${API_URL}/transfer/playlists`, {
        token: sourceAccount.accessToken
      });
      const playlists = playlistsResponse.data.playlists;

      // Transfer playlists
      if (playlists.length > 0) {
        setProgress({ step: `Transferring ${playlists.length} playlists...`, percentage: 65 });
        await axios.post(`${API_URL}/transfer/transfer-playlists`, {
          targetToken: targetAccount.accessToken,
          targetUserId: targetProfile.data.id,
          playlists
        });
      }

      // Get followed artists
      setProgress({ step: 'Loading followed artists...', percentage: 80 });
      const artistsResponse = await axios.post(`${API_URL}/transfer/followed-artists`, {
        token: sourceAccount.accessToken
      });
      const artists = artistsResponse.data.artists;

      // Transfer followed artists
      if (artists.length > 0) {
        setProgress({ step: `Transferring ${artists.length} followed artists...`, percentage: 90 });
        const artistIds = artists.map(artist => artist.id);
        await axios.post(`${API_URL}/transfer/transfer-followed-artists`, {
          targetToken: targetAccount.accessToken,
          artistIds
        });
      }

      setProgress({ step: 'Transfer complete! 🎉', percentage: 100 });
      setComplete(true);
    } catch (error) {
      console.error('Transfer error:', error);
      alert('An error occurred during transfer. Please try again.');
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="App">
      {/* Animated background */}
      <div className="background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Main content */}
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="header"
        >
          <h1 className="title">
            <span className="gradient-text">Spotify</span> Account Transfer
          </h1>
          <p className="subtitle">
            Seamlessly transfer your liked songs, playlists, and followed artists between accounts
          </p>
        </motion.div>

        <div className="accounts-section">
          {/* Source Account */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="account-card glass"
          >
            <div className="card-header">
              <h2>Source Account</h2>
              <span className="badge">From</span>
            </div>
            {sourceAccount ? (
              <div className="account-info">
                <div className="status-indicator connected"></div>
                <p className="status-text">✓ Connected</p>
                <button onClick={() => handleLogout('source')} className="btn btn-secondary">
                  Disconnect
                </button>
              </div>
            ) : (
              <button onClick={() => handleLogin('source')} className="btn btn-primary">
                <span className="btn-icon">♪</span>
                Connect Spotify
              </button>
            )}
          </motion.div>

          {/* Transfer Arrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="transfer-arrow"
          >
            →
          </motion.div>

          {/* Target Account */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="account-card glass"
          >
            <div className="card-header">
              <h2>Target Account</h2>
              <span className="badge badge-target">To</span>
            </div>
            {targetAccount ? (
              <div className="account-info">
                <div className="status-indicator connected"></div>
                <p className="status-text">✓ Connected</p>
                <button onClick={() => handleLogout('target')} className="btn btn-secondary">
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                onClick={() => handleLogin('target')} 
                className="btn btn-primary"
                disabled={!sourceAccount}
              >
                <span className="btn-icon">♪</span>
                Connect Spotify
              </button>
            )}
          </motion.div>
        </div>

        {/* Transfer Button */}
        <AnimatePresence>
          {sourceAccount && targetAccount && !transferring && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
              className="transfer-section"
            >
              <button onClick={startTransfer} className="btn btn-transfer glass">
                <span className="btn-icon">⚡</span>
                Start Transfer
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress */}
        <AnimatePresence>
          {transferring && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="progress-card glass"
            >
              <h3>{progress.step}</h3>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="progress-text">{progress.percentage}%</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {complete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="success-card glass"
            >
              <div className="success-icon">✓</div>
              <h2>Transfer Complete!</h2>
              <p>Your music library has been successfully transferred</p>
              <button 
                onClick={() => {
                  setSourceAccount(null);
                  setTargetAccount(null);
                  setComplete(false);
                }} 
                className="btn btn-primary"
              >
                Transfer Another Account
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="features-section"
        >
          <h2 className="features-title">What Gets Transferred</h2>
          <div className="features-grid">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="feature-card glass"
            >
              <div className="feature-icon">❤️</div>
              <h3>Liked Songs</h3>
              <p>All your favorite tracks transferred to your liked songs library</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="feature-card glass"
            >
              <div className="feature-icon">📋</div>
              <h3>Playlists</h3>
              <p>Complete playlists with all tracks and metadata</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="feature-card glass"
            >
              <div className="feature-icon">🎤</div>
              <h3>Followed Artists</h3>
              <p>All artists you follow will be followed on the new account</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>Made with ❤️ for music lovers</p>
      </footer>
    </div>
  );
}

export default App;

