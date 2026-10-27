# Episode 36 - L'espace n'a peut-etre pas de fin (l'espace est-il infini ?)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.4),
    ("say", "claude", [
        ("Imagine : tu pars tout droit dans l'espace, et tu ne t'arrêtes jamais. Est-ce qu'un jour, tu tomberais sur un mur ?",
         "Imagine: you head straight out into space, and you never stop. Would you one day hit a wall?"),
    ], "serious"),
    ("cue", "title"),
    ("title", "L'ESPACE N'A PEUT-ÊTRE PAS DE FIN", "Space may have no end", 2.8),
    ("pause", 2.6),

    ("scene", "bulle"),
    ("say", "claude", [
        ("Ce qu'on peut voir s'appelle l'univers observable : une bulle d'environ 93 milliards d'années-lumière de large, avec nous au centre.",
         "What we can see is called the observable universe: a bubble about 93 billion light-years across, with us at the centre."),
    ], "neutral"),
    ("cue", "lumiere"),
    ("say", "claude", [
        ("Pourquoi une limite ? Parce que l'univers a 13,8 milliards d'années. La lumière venue de plus loin n'a pas encore eu le temps d'arriver jusqu'à nous.",
         "Why a limit? Because the universe is 13.8 billion years old. Light from further away hasn't had time to reach us yet."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "expansion"),
    ("say", "claude", [
        ("Et la bulle est bien plus grande que 13,8 milliards d'années-lumière, parce que l'espace lui-même s'étire depuis le Big Bang.",
         "And the bubble is much bigger than 13.8 billion light-years, because space itself has been stretching since the Big Bang."),
    ], "awe"),
    ("cue", "partout"),
    ("say", "claude", [
        ("Le Big Bang n'est pas une explosion en un point : il a eu lieu partout à la fois. Au-delà de notre bulle, il y a très probablement d'autres galaxies… juste trop loin pour qu'on les voie.",
         "The Big Bang wasn't an explosion at one point: it happened everywhere at once. Beyond our bubble, there are very likely more galaxies… just too far away to see."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "formes"),
    ("say", "claude", [
        ("Alors, deux possibilités. Soit l'espace est infini, et il continue pour toujours.",
         "So, two possibilities. Either space is infinite, and it goes on forever."),
    ], "neutral"),
    ("cue", "ballon"),
    ("say", "claude", [
        ("Soit il est fini, mais sans bord, comme la surface d'un ballon : une fourmi peut y marcher sans jamais trouver de mur… et revenir à son point de départ.",
         "Or it's finite but has no edge, like the surface of a balloon: an ant can walk on it without ever finding a wall… and come back to where it started."),
    ], "happy"),
    ("cue", "retour"),
    ("say", "claude", [
        ("Dans un univers comme ça, en allant tout droit, tu reviendrais… par derrière.",
         "In a universe like that, going straight ahead, you'd come back… from behind."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "planck"),
    ("say", "claude", [
        ("Pour trancher, les astronomes mesurent la courbure de l'espace. Le satellite Planck l'a trouvée presque parfaitement plate.",
         "To settle it, astronomers measure the curvature of space. The Planck satellite found it almost perfectly flat."),
    ], "neutral"),
    ("cue", "verdict"),
    ("say", "claude", [
        ("Donc, soit l'univers est infini, soit il est si gigantesque que sa courbure est invisible pour nous. Personne ne sait encore.",
         "So either the universe is infinite, or it's so gigantic that its curvature is invisible to us. Nobody knows yet."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("Et si l'espace est infini, certains physiciens imaginent que, quelque part, très loin, une autre Terre existe… avec un autre toi, qui regarde cette vidéo.",
         "And if space is infinite, some physicists imagine that somewhere, very far away, another Earth exists… with another you, watching this video."),
    ], "awe"),
    ("cue", "question"),
    ("say", "claude", [
        ("Infini ou pas : toi, tu en penses quoi ? Dis-le-moi en commentaire.",
         "Infinite or not: what do you think? Tell me in the comments."),
    ], "happy"),
    ("pause", 1.6),
]
