# Episode 32 - Le Soleil fonce a 830 000 km/h (dans l'espace, tout tombe)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "newton": dict(voice="fr-FR-HenriNeural", rate="+0%", pitch="-3Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.4),
    ("say", "claude", [
        ("Là, maintenant, tu te crois immobile. Pourtant, le Soleil fonce à environ 830 000 kilomètres à l'heure… et il nous emporte tous avec lui.",
         "Right now, you think you're standing still. Yet the Sun is racing at about 830,000 kilometres per hour… and it's taking all of us with it."),
    ], "serious"),
    ("cue", "title"),
    ("title", "LE SOLEIL FONCE À 830 000 KM/H", "The Sun is racing at 830,000 km/h", 2.8),
    ("pause", 2.6),

    ("scene", "canon"),
    ("date", "1687 · Isaac Newton", "1687 · Isaac Newton", 2.4),
    ("pause", 0.3),
    ("say", "claude", [
        ("Pour comprendre, Isaac Newton imagine un canon tout en haut d'une immense montagne.",
         "To understand, Isaac Newton imagines a cannon at the top of a huge mountain."),
    ], "neutral"),
    ("cue", "tir1"),
    ("say", "newton", [("Si je tire doucement, le boulet retombe tout près.", "If I fire gently, the ball lands close by.")], "neutral"),
    ("cue", "tir2"),
    ("say", "newton", [("Plus fort… il tombe plus loin.", "Harder… it lands further away.")], "happy"),
    ("cue", "tir3"),
    ("say", "claude", [
        ("Et à environ huit kilomètres par seconde, le boulet tombe toujours… mais la Terre est ronde, et le sol se dérobe sous lui. Il tombe autour.",
         "And at about eight kilometres per second, the ball keeps falling… but the Earth is round, and the ground curves away beneath it. It falls around."),
    ], "happy"),
    ("cue", "orbite"),
    ("say", "claude", [
        ("Une orbite, c'est une chute qui ne finit jamais.",
         "An orbit is a fall that never ends."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "lune"),
    ("say", "claude", [
        ("C'est exactement ce que fait la Lune. Elle tombe autour de la Terre, à 384 000 kilomètres, à un kilomètre par seconde. Un tour : un peu plus de 27 jours.",
         "That's exactly what the Moon does. It falls around the Earth, 384,000 kilometres away, at one kilometre per second. One lap: just over 27 days."),
    ], "neutral"),
    ("cue", "face"),
    ("say", "claude", [
        ("Et comme elle tourne sur elle-même dans le même temps, elle nous montre toujours la même face.",
         "And since it spins on itself in the same time, it always shows us the same face."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "terre"),
    ("say", "claude", [
        ("La Terre, elle, tombe autour du Soleil, à 150 millions de kilomètres, en emmenant la Lune. Un tour, c'est une année. Pour le boucler, elle file à 30 kilomètres par seconde : plus de 100 000 kilomètres à l'heure.",
         "The Earth falls around the Sun, 150 million kilometres away, taking the Moon along. One lap is a year. To complete it, it travels at 30 kilometres per second: over 100,000 kilometres per hour."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "eclipse"),
    ("say", "claude", [
        ("Alors pourquoi pas une éclipse chaque mois ? Parce que l'orbite de la Lune est penchée d'environ 5 degrés : le plus souvent, elle passe au-dessus ou au-dessous de la ligne Soleil-Terre.",
         "So why isn't there an eclipse every month? Because the Moon's orbit is tilted by about 5 degrees: most of the time, it passes above or below the Sun-Earth line."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "galaxie"),
    ("say", "claude", [
        ("Et le Soleil ? Il tombe autour du centre de la Voie lactée, à 230 kilomètres par seconde. Un seul tour dure environ 230 millions d'années.",
         "And the Sun? It falls around the centre of the Milky Way, at 230 kilometres per second. A single lap takes about 230 million years."),
    ], "awe"),
    ("cue", "dinos"),
    ("say", "claude", [
        ("La dernière fois qu'il est passé par ici, les premiers dinosaures venaient à peine d'apparaître.",
         "The last time it passed this way, the first dinosaurs had only just appeared."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("Dans l'espace, tout tombe, sans jamais s'écraser. Et toi, tu savais qu'en ce moment même, tu étais en train de tomber ? Dis-le-moi en commentaire.",
         "In space, everything falls, without ever crashing. And you, did you know that right now, you're falling? Tell me in the comments."),
    ], "happy"),
    ("pause", 1.6),
]
