import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import axios from 'axios';

// API URL - uses environment variable in production, localhost in development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8888';

function App() {
  // Store all connected accounts
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [selectedSourceId, setSelectedSourceId] = useState(null);
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [transferring, setTransferring] = useState(false);
  const [progress, setProgress] = useState({ step: '', percentage: 0 });
  const [complete, setComplete] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  // Load saved accounts from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('spotifyAccounts');
    if (saved) {
      setConnectedAccounts(JSON.parse(saved));
    }
  }, []);

  // Save accounts to localStorage whenever they change
  useEffect(() => {
    if (connectedAccounts.length > 0) {
      localStorage.setItem('spotifyAccounts', JSON.stringify(connectedAccounts));
    }
  }, [connectedAccounts]);

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const error = params.get('error');

    if (accessToken) {
      setIsAddingAccount(true);
      // Fetch user profile to get account details
      fetchUserProfile(accessToken, refreshToken);
      // Clean URL
      window.history.replaceState({}, document.title, '/');
    }

    if (error) {
      alert('Authentication failed. Please try again.');
      window.history.replaceState({}, document.title, '/');
      setIsAddingAccount(false);
    }
  }, []);

  const fetchUserProfile = async (accessToken, refreshToken) => {
    try {
      // Add a small delay to ensure backend is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await axios.post(`${API_URL}/transfer/profile`, {
        token: accessToken
      });
      
      const profile = response.data;
      
      // Check if account already exists
      const exists = connectedAccounts.find(acc => acc.id === profile.id);
      if (exists) {
        alert('This account is already connected!');
        setIsAddingAccount(false);
        return;
      }

      // Add new account with profile data
      const newAccount = {
        id: profile.id,
        displayName: profile.display_name,
        email: profile.email,
        product: profile.product, // premium, free, etc.
        accessToken,
        refreshToken,
        addedAt: new Date().toISOString()
      };

      setConnectedAccounts(prev => [...prev, newAccount]);
      setIsAddingAccount(false);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'success-notification';
      notification.textContent = `✓ Account "${profile.display_name}" connected!`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      console.error('Error details:', error.response?.data);
      
      setIsAddingAccount(false);
      
      // More detailed error message
      const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
      alert(`Failed to fetch account details.\n\nError: ${errorMsg}\n\nPlease try:\n1. Logging out of Spotify completely\n2. Then try connecting again`);
    }
  };

  const handleAddAccount = () => {
    window.location.href = `${API_URL}/auth/login`;
  };

  const handleRemoveAccount = (accountId) => {
    if (window.confirm('Are you sure you want to disconnect this account?')) {
      setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId));
      if (selectedSourceId === accountId) setSelectedSourceId(null);
      if (selectedTargetId === accountId) setSelectedTargetId(null);
    }
  };

  const getAccountById = (id) => {
    return connectedAccounts.find(acc => acc.id === id);
  };

  const startTransfer = async () => {
    const sourceAccount = getAccountById(selectedSourceId);
    const targetAccount = getAccountById(selectedTargetId);

    if (!sourceAccount || !targetAccount) {
      alert('Please select both source and target accounts!');
      return;
    }

    if (selectedSourceId === selectedTargetId) {
      alert('Source and target accounts must be different!');
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
          
          {isAddingAccount && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="loading-notification glass"
            >
              <div className="spinner"></div>
              <span>Adding account...</span>
            </motion.div>
          )}
        </motion.div>

        <div className="accounts-section">
          {/* Source Account Selector */}
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
            
            <div className="account-selector">
              <div className="dropdown-container">
                <button 
                  className="dropdown-trigger btn btn-primary"
                  onClick={() => setShowSourceDropdown(!showSourceDropdown)}
                >
                  {selectedSourceId ? (
                    <>
                      <span className="btn-icon">👤</span>
                      {getAccountById(selectedSourceId)?.displayName}
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">♪</span>
                      Select Account
                    </>
                  )}
                  <span className="dropdown-arrow">▼</span>
                </button>

                <AnimatePresence>
                  {showSourceDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="dropdown-menu glass"
                    >
                      {connectedAccounts.map(account => (
                        <div 
                          key={account.id}
                          className={`dropdown-item ${selectedSourceId === account.id ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedSourceId(account.id);
                            setShowSourceDropdown(false);
                          }}
                        >
                          <div className="account-item-info">
                            <span className="account-name">{account.displayName}</span>
                            {account.product === 'premium' && (
                              <span className="premium-pill">Premium</span>
                            )}
                            {account.product === 'free' && (
                              <span className="free-pill">Free</span>
                            )}
                          </div>
                          <button
                            className="remove-account-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAccount(account.id);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      
                      <div className="dropdown-divider"></div>
                      
                      <div 
                        className="dropdown-item add-account"
                        onClick={() => {
                          handleAddAccount();
                          setShowSourceDropdown(false);
                        }}
                      >
                        <span className="btn-icon">+</span>
                        Add Account
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
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

          {/* Target Account Selector */}
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
            
            <div className="account-selector">
              <div className="dropdown-container">
                <button 
                  className="dropdown-trigger btn btn-primary"
                  onClick={() => setShowTargetDropdown(!showTargetDropdown)}
                >
                  {selectedTargetId ? (
                    <>
                      <span className="btn-icon">👤</span>
                      {getAccountById(selectedTargetId)?.displayName}
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">♪</span>
                      Select Account
                    </>
                  )}
                  <span className="dropdown-arrow">▼</span>
                </button>

                <AnimatePresence>
                  {showTargetDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="dropdown-menu glass"
                    >
                      {connectedAccounts.map(account => (
                        <div 
                          key={account.id}
                          className={`dropdown-item ${selectedTargetId === account.id ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedTargetId(account.id);
                            setShowTargetDropdown(false);
                          }}
                        >
                          <div className="account-item-info">
                            <span className="account-name">{account.displayName}</span>
                            {account.product === 'premium' && (
                              <span className="premium-pill">Premium</span>
                            )}
                            {account.product === 'free' && (
                              <span className="free-pill">Free</span>
                            )}
                          </div>
                          <button
                            className="remove-account-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAccount(account.id);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      
                      <div className="dropdown-divider"></div>
                      
                      <div 
                        className="dropdown-item add-account"
                        onClick={() => {
                          handleAddAccount();
                          setShowTargetDropdown(false);
                        }}
                      >
                        <span className="btn-icon">+</span>
                        Add Account
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Transfer Button */}
        <AnimatePresence>
          {selectedSourceId && selectedTargetId && !transferring && !complete && (
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
                  setSelectedSourceId(null);
                  setSelectedTargetId(null);
                  setComplete(false);
                }} 
                className="btn btn-primary"
              >
                Transfer Again
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

