# Episode 39 - Les derniers mots de la Bible (Apocalypse 22, 16-21) - serie : on remonte la Bible scene par scene
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("La Bible compte plus de mille pages… et elles se terminent par une promesse que personne n'a encore vue se réaliser.",
         "The Bible has over a thousand pages… and they end with a promise no one has yet seen come true."),
    ], "serious"),
    ("cue", "serie"),
    ("say", "claude", [
        ("Dans cette série, on remonte la Bible scène par scène, de la dernière page jusqu'à la toute première. Et on commence… par la fin.",
         "In this series, we go back through the Bible scene by scene, from the last page to the very first. And we start… at the end."),
    ], "happy"),
    ("cue", "title"),
    ("title", "IL REVIENT\\NBIENTÔT", "He is coming back soon", 2.8),
    ("pause", 2.6),

    ("scene", "patmos"),
    ("say", "claude", [
        ("Nous sommes à la fin du premier siècle, sur Patmos, une petite île grecque. Selon le texte, un homme nommé Jean y est exilé. Il vient de recevoir une immense vision : c'est le livre de l'Apocalypse. Aujourd'hui encore, on visite sur l'île la grotte où la tradition situe cette vision. Et la vision touche à sa fin.",
         "We're at the end of the first century, on Patmos, a small Greek island. According to the text, a man named John is exiled there. He has just received an immense vision: the Book of Revelation. Even today, visitors can see the cave where tradition places this vision. And the vision is coming to an end."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "etoile"),
    ("say", "claude", [
        ("Alors une voix se présente. Selon le texte, c'est Jésus lui-même qui parle :",
         "Then a voice introduces itself. According to the text, it's Jesus himself speaking:"),
    ], "neutral"),
    ("say", "voix", [
        ("« Je suis le rejeton et la postérité de David, l'étoile brillante du matin. »",
         "\"I am the root and the offspring of David, and the bright and morning star.\""),
    ], "serious"),
    ("cue", "david"),
    ("say", "claude", [
        ("Le rejeton de David, c'est une façon de dire : je suis le descendant du roi David, le roi promis par les prophètes. Et l'étoile du matin, c'est la planète Vénus, qui brille juste avant l'aube : le signe qu'une longue nuit se termine.",
         "The offspring of David means: I am the descendant of King David, the king promised by the prophets. And the morning star is the planet Venus, which shines just before dawn: the sign that a long night is ending."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "viens"),
    ("say", "claude", [
        ("Puis vient un appel, répété trois fois :",
         "Then comes a call, repeated three times:"),
    ], "neutral"),
    ("say", "voix", [
        ("« Et l'Esprit et l'épouse disent : Viens. Et que celui qui entend dise : Viens. Et que celui qui a soif vienne ; que celui qui veut prenne de l'eau de la vie, gratuitement. »",
         "\"And the Spirit and the bride say, Come. And let him that heareth say, Come. And let him that is athirst come. And whosoever will, let him take the water of life freely.\""),
    ], "serious"),
    ("cue", "epouse"),
    ("say", "claude", [
        ("L'épouse, dans l'Apocalypse, c'est l'image de tous les croyants réunis. Et l'eau de la vie est offerte… gratuitement. Le mot est important : à la fin de la Bible, rien n'est à vendre.",
         "The bride, in Revelation, is the image of all believers gathered together. And the water of life is offered… for free. The word matters: at the end of the Bible, nothing is for sale."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "avertissement"),
    ("say", "claude", [
        ("Ensuite, un avertissement très sérieux :",
         "Next, a very serious warning:"),
    ], "serious"),
    ("say", "voix", [
        ("« Si quelqu'un y ajoute quelque chose, Dieu le frappera des fléaux décrits dans ce livre ; et si quelqu'un retranche quelque chose, Dieu retranchera sa part de l'arbre de la vie. »",
         "\"If any man shall add unto these things, God shall add unto him the plagues that are written in this book: and if any man shall take away, God shall take away his part out of the book of life.\""),
    ], "serious"),
    ("cue", "copistes"),
    ("say", "claude", [
        ("À l'époque, il n'y a pas d'imprimerie : chaque livre est recopié à la main. Cet avertissement protège le texte contre ceux qui voudraient le modifier. Le plus ancien manuscrit complet de l'Apocalypse qui nous soit parvenu, le Codex Sinaiticus, a été copié au quatrième siècle.",
         "At the time, there is no printing press: every book is copied by hand. This warning protects the text against anyone who might want to change it. The oldest complete manuscript of Revelation that has come down to us, the Codex Sinaiticus, was copied in the fourth century."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "bientot"),
    ("say", "claude", [
        ("Et enfin, Jésus prononce ses toutes dernières paroles :",
         "And finally, Jesus speaks his very last words:"),
    ], "neutral"),
    ("say", "voix", [
        ("« Oui, je viens bientôt. »", "\"Surely I come quickly.\""),
    ], "serious"),
    ("cue", "repond"),
    ("say", "claude", [
        ("Jean répond : « Amen ! Viens, Seigneur Jésus ! » Cette prière existait déjà chez les premiers chrétiens, en araméen, la langue de Jésus : Maranatha, « Seigneur, viens ». Et le dernier verset de toute la Bible tient en une phrase : « Que la grâce du Seigneur Jésus soit avec tous ! »",
         "John answers: \"Amen. Even so, come, Lord Jesus.\" This prayer already existed among the first Christians, in Aramaic, the language of Jesus: Maranatha, \"Lord, come\". And the very last verse of the whole Bible fits in one sentence: \"The grace of our Lord Jesus Christ be with you all.\""),
    ], "happy"),
    ("cue", "attente"),
    ("say", "claude", [
        ("« Bientôt »… Cela fait près de deux mille ans. Pour les croyants, la Bible se termine donc par une attente, encore ouverte aujourd'hui.",
         "\"Quickly\"… It's been nearly two thousand years. For believers, the Bible ends with a wait that is still open today."),
    ], "serious"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, Jean tombe à genoux devant un ange, pour l'adorer… et l'ange lui ordonne de se relever immédiatement. Pourquoi ? Ce sera le prochain épisode.",
         "But this story follows another one. Just before, John falls to his knees before an angel, to worship him… and the angel orders him to get up immediately. Why? That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
