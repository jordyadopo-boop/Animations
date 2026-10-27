# Episode 24 - Pourquoi cet ange est-il arme ? (Watchers in the Night, Thomas Blackshear II)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Un ange immense veille sur un enfant endormi. Dans une main, une flamme. Dans l'autre… une lance.",
         "A huge angel watches over a sleeping child. In one hand, a flame. In the other… a spear."),
    ], "serious"),
    ("cue", "hasard"),
    ("say", "claude", [("Ce n'est pas un hasard : chaque détail de ce tableau a un sens.", "It's no accident: every detail in this painting means something.")], "serious"),
    ("cue", "title"),
    ("title", "POURQUOI CET ANGE EST-IL ARMÉ ?", "Why is this angel armed?", 2.6),
    ("pause", 2.5),

    ("scene", "peintre"),
    ("say", "claude", [
        ("Ce tableau s'appelle « Watchers in the Night », les veilleurs de la nuit. Il est signé Thomas Blackshear, un peintre américain né en 1955 au Texas.",
         "This painting is called \"Watchers in the Night\". It's by Thomas Blackshear, an American painter born in 1955 in Texas."),
    ], "neutral"),
    ("cue", "starwars"),
    ("say", "claude", [
        ("Il a travaillé pour Star Wars, dessiné une trentaine de timbres… et il est célèbre pour ses anges.",
         "He worked on Star Wars, designed some thirty stamps… and he's famous for his angels."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "vue"),
    ("say", "claude", [
        ("D'abord, regarde d'où l'on voit la scène : d'en bas, presque à hauteur du lit. Du coup, l'ange paraît gigantesque. Il ne tient même pas dans le cadre : ses ailes et sa lance en sortent.",
         "First, look at where we see the scene from: from below, almost at bed level. So the angel looks gigantic. He doesn't even fit in the frame: his wings and spear go beyond it."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "ailes"),
    ("say", "claude", [
        ("Ses ailes ne sont pas ouvertes pour voler. L'une descend comme un rideau sur le côté, l'autre passe au-dessus du lit comme un toit. Ensemble, elles forment un abri autour de l'enfant.",
         "His wings aren't spread to fly. One comes down like a curtain on the side, the other passes over the bed like a roof. Together, they form a shelter around the child."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "lumiere"),
    ("say", "claude", [
        ("Il n'y a qu'une lumière : la petite flamme posée dans sa main. Elle éclaire son visage par en dessous et dore sa tunique.",
         "There's only one light: the small flame resting in his hand. It lights his face from below and turns his tunic gold."),
    ], "neutral"),
    ("cue", "esprit"),
    ("say", "claude", [
        ("Dans les descriptions du tableau, cette flamme représente la présence du Saint-Esprit.",
         "In descriptions of the painting, this flame represents the presence of the Holy Spirit."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "lance"),
    ("say", "claude", [
        ("Et la lance ? Regarde bien : elle est droite, au repos, pointée vers le ciel, vers personne. C'est la lance d'une sentinelle.",
         "And the spear? Look closely: it's upright, at rest, pointing to the sky, at no one. It's a sentry's spear."),
    ], "serious"),
    ("cue", "garde"),
    ("say", "claude", [
        ("L'ange n'attaque pas : il monte la garde. Son visage est calme… mais il reste debout, toute la nuit.",
         "The angel isn't attacking: he's standing guard. His face is calm… but he stays standing, all night long."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "enfant"),
    ("say", "claude", [
        ("Tout en bas, l'enfant en pyjama bleu dort recroquevillé, les mains près du visage. Minuscule à côté de l'ange… et il ne se doute de rien.",
         "At the very bottom, the child in blue pyjamas sleeps curled up, hands near his face. Tiny next to the angel… and he has no idea."),
    ], "neutral"),
    ("cue", "diagonale"),
    ("say", "claude", [
        ("La lumière part de la flamme et descend jusqu'à lui. Le sujet du tableau, c'est ça : être protégé sans le savoir.",
         "The light starts at the flame and comes down to him. That's what the painting is about: being protected without knowing it."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "titre"),
    ("say", "claude", [
        ("Un détail intrigue : le titre dit « les veilleurs », au pluriel. Pourtant, on ne voit qu'un seul ange.",
         "One detail is intriguing: the title says \"watchers\", plural. Yet we only see one angel."),
    ], "serious"),
    ("cue", "pluriel"),
    ("say", "claude", [
        ("D'autres veillent peut-être hors du cadre… ou alors, les veilleurs, ce sont aussi les parents. Ou toi, qui regardes. Ce n'est qu'une interprétation.",
         "Maybe others are watching outside the frame… or the watchers are also the parents. Or you, looking at it. It's only an interpretation."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "textes"),
    ("say", "claude", [
        ("Cette idée vient de la Bible. Selon le livre des Psaumes : « Il ordonnera à ses anges de te garder dans toutes tes voies. »",
         "This idea comes from the Bible. According to the Book of Psalms: \"He shall give his angels charge over thee, to keep thee in all thy ways.\""),
    ], "neutral"),
    ("cue", "matthieu"),
    ("say", "claude", [
        ("Selon l'Évangile de Saint Matthieu, les anges des tout-petits voient sans cesse la face du Père.",
         "According to the Gospel of Saint Matthew, the angels of little ones always see the face of the Father."),
    ], "neutral"),
    ("cue", "genese"),
    ("say", "claude", [
        ("Et dans la Genèse, des chérubins tiennent même une épée flamboyante pour garder le jardin d'Éden.",
         "And in Genesis, cherubim even hold a flaming sword to guard the Garden of Eden."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("Alors, rassurant ou inquiétant ? Si un ange veillait vraiment sur toi cette nuit… tu aimerais le voir, ou préférerais-tu ne jamais le savoir ?",
         "So, reassuring or unsettling? If an angel really watched over you tonight… would you want to see him, or would you rather never know?"),
    ], "serious"),
    ("cue", "question"),
    ("say", "claude", [("Dis-le-moi en commentaire.", "Tell me in the comments.")], "neutral"),
    ("pause", 1.8),
]
