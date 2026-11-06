// Pas de bande-son pour ces images d'essai : un silence de la bonne durée.
const path = require('path');
const MIX = require('./engine/audio/mix');
const { SR, Bus } = require('./engine/audio/dsp');
const sc = require('./score');
const mix = new Bus(Math.ceil(sc.DURATION * SR));
MIX.writeWav(path.join(__dirname, 'out', 'music.wav'), mix);
console.log('wrote out/music.wav (silence)');
