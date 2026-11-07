
// ================= episode 53 : un nom ecrit sur son front : Mystere (Apocalypse 17, 1-6)
function foreheadName(w, text = 'MYSTÈRE', sz = 0.5) { const l = label(text, { w: sz, h: sz * 0.24, color: '#ffd070', font: 'bold 110px Inter' }); w.neck.add(l); l.position.set(0, 0.24, 0.17); return l; }
function bowlAngel(i) { const a = angel(); const b = angelBowl(a); b.scale.setScalar(1.6); a.bowl = b; return a; }
function nameCard(text, color = '#ff5a3a') { return card(text, { w: 0.8, h: 0.15, border: color, color: '#ffd0c0' }); }

