# Episode 25 - Le faune qui jouait pour les chevres (Faune au clair de lune, Leon Spilliaert, 1900)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Sous une lune blanche, une créature à cornes danse sur une seule jambe et joue de la flûte. Et les chèvres… la suivent.",
         "Under a white moon, a horned creature dances on one leg and plays the flute. And the goats… follow."),
    ], "serious"),
    ("cue", "malaise"),
    ("say", "claude", [("Ce dessin a plus de 120 ans, et il met toujours mal à l'aise.", "This drawing is over 120 years old, and it's still unsettling.")], "serious"),
    ("cue", "title"),
    ("title", "LE FAUNE QUI JOUAIT POUR LES CHÈVRES", "The faun who played for the goats", 2.6),
    ("pause", 2.5),

    ("scene", "artiste"),
    ("say", "claude", [
        ("Il s'appelle « Faune au clair de lune ». Il est signé Léon Spilliaert, un Belge d'Ostende, en 1900. Il n'a même pas vingt ans.",
         "It's called \"Faun by Moonlight\". It's signed Léon Spilliaert, a Belgian from Ostend, in 1900. He isn't even twenty."),
    ], "neutral"),
    ("cue", "insomnie"),
    ("say", "claude", [
        ("Fragile, souvent malade, il souffre d'insomnie et marche la nuit au bord de la mer.",
         "Frail, often ill, he suffers from insomnia and walks by the sea at night."),
    ], "neutral"),
    ("cue", "encre"),
    ("say", "claude", [("Pas de peinture ici : de l'encre, de la craie noire et quelques crayons de couleur, sur du papier.", "No paint here: ink, black chalk and a few coloured pencils, on paper.")], "neutral"),
    ("pause", 0.3),

    ("scene", "ciel"),
    ("say", "claude", [
        ("Regarde le ciel : autour de la lune, des traits tournent en spirale, comme un tourbillon. Et cette lumière ne réchauffe rien : tout est gris, presque sans couleur.",
         "Look at the sky: around the moon, strokes swirl in a spiral, like a whirlpool. And this light warms nothing: everything is grey, almost colourless."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "faune"),
    ("say", "claude", [
        ("Au centre, le faune : une silhouette noire, des cornes, des pattes de bouc. Il danse sur une jambe et souffle dans une double flûte.",
         "In the centre, the faun: a black silhouette, horns, goat legs. He dances on one leg and blows into a double flute."),
    ], "neutral"),
    ("cue", "visage"),
    ("say", "claude", [("On ne voit pas son visage : seulement une ombre qui bouge.", "We can't see his face: only a moving shadow.")], "serious"),
    ("pause", 0.3),

    ("scene", "chevres"),
    ("say", "claude", [
        ("À gauche, quatre chèvres avancent en file vers lui. La plus proche se dresse sur ses pattes arrière, comme si elle dansait aussi. Elles semblent obéir à la musique.",
         "On the left, four goats walk towards him in a line. The closest one rears up on its hind legs, as if it were dancing too. They seem to obey the music."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "ombres"),
    ("say", "claude", [
        ("Leurs ombres immenses s'étirent vers nous, comme si la scène débordait du dessin.",
         "Their huge shadows stretch towards us, as if the scene were spilling out of the drawing."),
    ], "serious"),
    ("cue", "branche"),
    ("say", "claude", [
        ("Et à droite, des arbres nus forment un mur sombre. Une branche s'avance au-dessus du faune… comme une main.",
         "And on the right, bare trees form a dark wall. A branch reaches out above the faun… like a hand."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "mytho"),
    ("say", "claude", [
        ("Le faune vient de la mythologie romaine : un esprit des bois, mi-homme mi-bouc, proche du dieu grec Pan.",
         "The faun comes from Roman mythology: a woodland spirit, half man, half goat, close to the Greek god Pan."),
    ], "neutral"),
    ("cue", "panique"),
    ("say", "claude", [
        ("D'ailleurs, le mot « panique » vient de Pan : on disait qu'il provoquait des peurs soudaines.",
         "In fact, the word \"panic\" comes from Pan: he was said to cause sudden fears."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "textes"),
    ("say", "claude", [
        ("Et les boucs ont un sens dans la Bible : selon l'Évangile de Saint Matthieu, au jugement, le berger sépare les brebis d'avec les boucs.",
         "And goats carry meaning in the Bible: according to the Gospel of Saint Matthew, at the judgement, the shepherd separates the sheep from the goats."),
    ], "neutral"),
    ("cue", "diable"),
    ("say", "claude", [
        ("Bien plus tard, l'image du diable a emprunté les cornes du bouc. Mais rien ne dit que Spilliaert a voulu dessiner le diable. Et c'est justement ce doute qui dérange.",
         "Much later, images of the devil borrowed the goat's horns. But nothing says Spilliaert meant to draw the devil. And it's precisely that doubt that disturbs."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("Alors, simple fête de la nature… ou appel dans la nuit ? Si tu entendais cette flûte au loin, une nuit de pleine lune… tu la suivrais ?",
         "So, a simple celebration of nature… or a call in the night? If you heard this flute in the distance, on a full-moon night… would you follow it?"),
    ], "serious"),
    ("cue", "question"),
    ("say", "claude", [("Dis-le-moi en commentaire.", "Tell me in the comments.")], "neutral"),
    ("pause", 1.8),
]
