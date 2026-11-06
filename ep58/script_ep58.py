# Episode 58 - Les fleuves deviennent du sang (Apocalypse 16, 4-7) - on remonte la Bible scene par scene
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Imaginez : vous allez boire à la rivière… et l'eau est rouge. Pas seulement la rivière : toutes les sources, partout.",
         "Imagine: you go to drink at the river… and the water is red. Not just the river: every spring, everywhere."),
    ], "serious"),
    ("cue", "serie"),
    ("say", "claude", [
        ("On remonte la Bible, scène par scène. La dernière fois, le soleil brûlait les hommes. Juste avant, c'est l'eau qui est frappée.",
         "We're going back through the Bible, scene by scene. Last time, the sun was scorching men. Just before, it's the water that is struck."),
    ], "neutral"),
    ("cue", "title"),
    ("title", "LES FLEUVES\\NDEVIENNENT DU SANG", "The rivers become blood", 2.8),
    ("pause", 2.6),

    ("scene", "fleuves"),
    ("say", "voix", [
        ("« Le troisième versa sa coupe dans les fleuves et dans les sources d'eaux. Et ils devinrent du sang. »",
         "\"And the third angel poured out his vial upon the rivers and fountains of waters; and they became blood.\""),
    ], "serious"),
    ("cue", "mer"),
    ("say", "claude", [
        ("Juste avant, la deuxième coupe avait frappé la mer. Cette fois, c'est l'eau qu'on boit : les fleuves et les sources.",
         "Just before, the second bowl had struck the sea. This time, it's the water people drink: the rivers and the springs."),
    ], "neutral"),
    ("cue", "douce"),
    ("say", "claude", [
        ("Et c'est la plus précieuse. Sur toute l'eau de la terre, à peine trois pour cent est de l'eau douce. Et un être humain ne survit que quelques jours sans boire.",
         "And it's the most precious. Of all the water on earth, barely three percent is fresh water. And a human being survives only a few days without drinking."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "egypte"),
    ("say", "claude", [
        ("Cette scène vous rappelle quelque chose ? C'est la toute première plaie d'Égypte. Moïse frappe le Nil avec son bâton, et toute l'eau du fleuve se change en sang.",
         "Does this scene remind you of something? It's the very first plague of Egypt. Moses strikes the Nile with his staff, and all the water of the river turns to blood."),
    ], "neutral"),
    ("cue", "poissons"),
    ("say", "claude", [
        ("Les poissons meurent, le fleuve devient infect, et les Égyptiens doivent creuser autour du Nil pour trouver de l'eau à boire.",
         "The fish die, the river stinks, and the Egyptians have to dig around the Nile to find water to drink."),
    ], "neutral"),
    ("cue", "nil"),
    ("say", "claude", [
        ("Or le Nil, c'était la vie de l'Égypte. On vénérait même Hâpy, le dieu de sa crue. Frapper le fleuve, c'était frapper leur dieu.",
         "Now the Nile was the life of Egypt. People even worshipped Hapi, the god of its flood. Striking the river meant striking their god."),
    ], "awe"),
    ("cue", "cana"),
    ("say", "claude", [
        ("Et regardez le contraste : le premier signe de Moïse change l'eau en sang. Le premier miracle de Jésus, à Cana, change l'eau en vin.",
         "And look at the contrast: Moses' first sign turns water into blood. Jesus' first miracle, at Cana, turns water into wine."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "ange"),
    ("say", "voix", [
        ("« Et j'entendis l'ange des eaux qui disait : Tu es juste, toi qui es, et qui étais ; tu es saint, parce que tu as exercé ce jugement. »",
         "\"And I heard the angel of the waters say, Thou art righteous, O Lord, which art, and wast, and shalt be, because thou hast judged thus.\""),
    ], "serious"),
    ("cue", "elements"),
    ("say", "claude", [
        ("Un ange des eaux… Dans l'Apocalypse, il y a aussi quatre anges qui retiennent les vents, et un ange qui a autorité sur le feu.",
         "An angel of the waters… In Revelation there are also four angels holding back the winds, and an angel who has power over fire."),
    ], "neutral"),
    ("cue", "viens"),
    ("say", "claude", [
        ("Petit détail : au début du livre, Dieu est celui qui est, qui était, et qui vient. Ici, dans les plus anciens manuscrits, plus de « qui vient ». Comme s'il était déjà venu.",
         "A small detail: at the start of the book, God is the one who is, who was, and who is to come. Here, in the oldest manuscripts, no more \"who is to come\". As if he had already come."),
    ], "awe"),
    ("cue", "verset6"),
    ("say", "voix", [
        ("« Car ils ont versé le sang des saints et des prophètes, et tu leur as donné du sang à boire : ils en sont dignes. »",
         "\"For they have shed the blood of saints and prophets, and thou hast given them blood to drink; for they are worthy.\""),
    ], "serious"),
    ("cue", "mesure"),
    ("say", "claude", [
        ("Ils ont versé le sang… ils boivent du sang. La punition ressemble exactement à la faute.",
         "They shed blood… they drink blood. The punishment looks exactly like the crime."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "autel"),
    ("say", "voix", [
        ("« Et j'entendis l'autel qui disait : Oui, Seigneur Dieu tout-puissant, tes jugements sont véritables et justes. »",
         "\"And I heard another out of the altar say, Even so, Lord God Almighty, true and righteous are thy judgments.\""),
    ], "serious"),
    ("cue", "ames"),
    ("say", "claude", [
        ("Et cet autel n'est pas là par hasard. Bien plus tôt dans l'Apocalypse, sous l'autel, les âmes des martyrs criaient : « Jusques à quand ne venges-tu pas notre sang ? »",
         "And this altar is not there by chance. Much earlier in Revelation, under the altar, the souls of the martyrs cried out: \"How long dost thou not avenge our blood?\""),
    ], "neutral"),
    ("cue", "reponse"),
    ("say", "claude", [
        ("On leur avait dit d'attendre encore un peu. Ici, l'autel répond enfin : oui, ces jugements sont justes.",
         "They had been told to wait a little longer. Here, the altar finally answers: yes, these judgments are just."),
    ], "awe"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, le deuxième ange verse sa coupe sur la mer. Elle devient comme le sang d'un mort, et tout ce qui vit dans la mer meurt. Ce sera le prochain épisode.",
         "But this story follows another one. Just before, the second angel pours out his bowl upon the sea. It becomes like the blood of a dead man, and every living thing in the sea dies. That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
