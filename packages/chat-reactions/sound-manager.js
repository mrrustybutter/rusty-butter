#!/usr/bin/env node

/**
 * Sound Effects Manager
 * 
 * Manages and plays sound effects for chat reactions
 * Integrates with OBS media sources
 */

import { EventEmitter } from 'events';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SoundEffectsManager extends EventEmitter {
  constructor() {
    super();
    
    // Sound library
    this.sounds = {
      // Excitement sounds
      'airhorn.mp3': {
        duration: 2000,
        volume: 0.7,
        category: 'excitement'
      },
      'hypetrain.mp3': {
        duration: 5000,
        volume: 0.8,
        category: 'hype'
      },
      'party.mp3': {
        duration: 3000,
        volume: 0.6,
        category: 'celebration'
      },
      
      // Emotion sounds
      'love.mp3': {
        duration: 2000,
        volume: 0.5,
        category: 'emotion'
      },
      'sad_violin.mp3': {
        duration: 3000,
        volume: 0.4,
        category: 'emotion'
      },
      'laugh.mp3': {
        duration: 2000,
        volume: 0.6,
        category: 'emotion'
      },
      
      // Action sounds
      'hello.mp3': {
        duration: 1000,
        volume: 0.5,
        category: 'greeting'
      },
      'mindblown.mp3': {
        duration: 3000,
        volume: 0.7,
        category: 'reaction'
      },
      'fire.mp3': {
        duration: 2000,
        volume: 0.6,
        category: 'reaction'
      },
      'applause.mp3': {
        duration: 3000,
        volume: 0.6,
        category: 'appreciation'
      },
      
      // Utility sounds
      'coffee_sip.mp3': {
        duration: 1500,
        volume: 0.4,
        category: 'utility'
      },
      'victory.mp3': {
        duration: 3000,
        volume: 0.7,
        category: 'gaming'
      },
      'f.mp3': {
        duration: 2000,
        volume: 0.5,
        category: 'meme'
      }
    };
    
    // Currently playing sounds
    this.playing = new Set();
    
    // Volume settings
    this.masterVolume = 1.0;
    this.categoryVolumes = {
      excitement: 1.0,
      hype: 1.0,
      celebration: 1.0,
      emotion: 1.0,
      greeting: 1.0,
      reaction: 1.0,
      appreciation: 1.0,
      utility: 1.0,
      gaming: 1.0,
      meme: 1.0
    };
  }
  
  // Play a sound effect
  async playSound(soundFile, options = {}) {
    // Check if sound exists
    const sound = this.sounds[soundFile];
    if (!sound) {
      console.warn(`Sound not found: ${soundFile}`);
      return false;
    }
    
    // Check if already playing (prevent spam)
    if (this.playing.has(soundFile)) {
      console.log(`Sound already playing: ${soundFile}`);
      return false;
    }
    
    // Calculate final volume
    const categoryVolume = this.categoryVolumes[sound.category] || 1.0;
    const finalVolume = sound.volume * categoryVolume * this.masterVolume;
    
    // Mark as playing
    this.playing.add(soundFile);
    
    // Emit play event
    this.emit('play', {
      file: soundFile,
      volume: finalVolume,
      duration: sound.duration,
      category: sound.category,
      ...options
    });
    
    console.log(`🔊 Playing: ${soundFile} (${sound.category}) at ${Math.round(finalVolume * 100)}% volume`);
    
    // Remove from playing after duration
    setTimeout(() => {
      this.playing.delete(soundFile);
      this.emit('ended', { file: soundFile });
    }, sound.duration);
    
    return true;
  }
  
  // Queue multiple sounds
  async playSoundQueue(soundFiles, delay = 500) {
    for (const soundFile of soundFiles) {
      await this.playSound(soundFile);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Play random sound from category
  playRandomFromCategory(category) {
    const categorySounds = Object.entries(this.sounds)
      .filter(([_, sound]) => sound.category === category)
      .map(([file, _]) => file);
    
    if (categorySounds.length === 0) {
      console.warn(`No sounds in category: ${category}`);
      return false;
    }
    
    const randomSound = categorySounds[Math.floor(Math.random() * categorySounds.length)];
    return this.playSound(randomSound);
  }
  
  // Set master volume
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    console.log(`Master volume set to ${Math.round(this.masterVolume * 100)}%`);
  }
  
  // Set category volume
  setCategoryVolume(category, volume) {
    if (this.categoryVolumes.hasOwnProperty(category)) {
      this.categoryVolumes[category] = Math.max(0, Math.min(1, volume));
      console.log(`${category} volume set to ${Math.round(this.categoryVolumes[category] * 100)}%`);
    }
  }
  
  // Get all available sounds
  getAvailableSounds() {
    return Object.entries(this.sounds).map(([file, info]) => ({
      file,
      ...info
    }));
  }
  
  // Get sounds by category
  getSoundsByCategory(category) {
    return this.getAvailableSounds().filter(sound => sound.category === category);
  }
  
  // Stop all sounds
  stopAll() {
    this.playing.clear();
    this.emit('stopAll');
    console.log('🔇 All sounds stopped');
  }
}

// Export for use
export default SoundEffectsManager;

// Demo if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const soundManager = new SoundEffectsManager();
  
  // Listen for sound events
  soundManager.on('play', (data) => {
    console.log('▶️  Sound started:', data);
  });
  
  soundManager.on('ended', (data) => {
    console.log('⏹️  Sound ended:', data.file);
  });
  
  console.log(`
╔════════════════════════════════════════════╗
║        🔊 SOUND EFFECTS MANAGER 🔊         ║
╚════════════════════════════════════════════╝
  `);
  
  // Show available sounds
  console.log('\n📚 Available Sounds by Category:\n');
  const categories = [...new Set(soundManager.getAvailableSounds().map(s => s.category))];
  
  categories.forEach(category => {
    console.log(`${category.toUpperCase()}:`);
    soundManager.getSoundsByCategory(category).forEach(sound => {
      console.log(`  - ${sound.file} (${sound.duration}ms, ${Math.round(sound.volume * 100)}% volume)`);
    });
    console.log('');
  });
  
  // Demo sequence
  console.log('🎵 Playing demo sequence...\n');
  
  const demoSequence = async () => {
    // Play greeting
    await soundManager.playSound('hello.mp3');
    await new Promise(r => setTimeout(r, 2000));
    
    // Play hype sounds
    await soundManager.playSound('airhorn.mp3');
    await new Promise(r => setTimeout(r, 1000));
    await soundManager.playSound('hypetrain.mp3');
    await new Promise(r => setTimeout(r, 3000));
    
    // Play random emotion
    soundManager.playRandomFromCategory('emotion');
    await new Promise(r => setTimeout(r, 2000));
    
    // Victory!
    await soundManager.playSound('victory.mp3');
    
    console.log('\n✅ Demo complete!');
  };
  
  demoSequence();
}