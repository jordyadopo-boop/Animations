# Episode 56 - Le royaume de la bete plonge dans les tenebres (Apocalypse 16, 10-11) - on remonte la Bible scene par scene
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Une coupe versée sur un trône. Et d'un coup, tout un royaume bascule dans le noir. Les hommes souffrent tellement… qu'ils se mordent la langue.",
         "A bowl poured upon a throne. And suddenly, a whole kingdom plunges into darkness. People suffer so much… that they gnaw their tongues."),
    ], "serious"),
    ("cue", "serie"),
    ("say", "claude", [
        ("On remonte la Bible, scène par scène. La dernière fois, trois esprits verts rassemblaient les rois à Harmaguédon. Juste avant, voici la cinquième coupe.",
         "We're going back through the Bible, scene by scene. Last time, three green spirits gathered the kings at Armageddon. Just before, here is the fifth bowl."),
    ], "neutral"),
    ("cue", "title"),
    ("title", "LE ROYAUME DE LA BÊTE\\NPLONGÉ DANS LES TÉNÈBRES", "The beast's kingdom plunged into darkness", 2.8),
    ("pause", 2.6),

    ("scene", "coupe"),
    ("say", "voix", [
        ("« Le cinquième versa sa coupe sur le trône de la bête. Et son royaume fut couvert de ténèbres. »",
         "\"And the fifth angel poured out his vial upon the seat of the beast; and his kingdom was full of darkness.\""),
    ], "serious"),
    ("cue", "cible"),
    ("say", "claude", [
        ("Cette fois, l'ange ne vise ni la mer, ni les fleuves, ni le soleil. Il vise directement le cœur du pouvoir : le trône. Le centre de commande de la bête est frappé.",
         "This time, the angel doesn't aim at the sea, the rivers or the sun. He aims straight at the heart of power: the throne. The beast's command centre is struck."),
    ], "neutral"),
    ("cue", "pergame"),
    ("say", "claude", [
        ("Le mot trône parlait aux premiers lecteurs. Dans sa lettre à la ville de Pergame, l'Apocalypse dit : « là où est le trône de Satan ». Pergame avait un immense autel, consacré à Zeus. On peut encore le voir aujourd'hui… dans un musée de Berlin.",
         "The word throne spoke to the first readers. In its letter to the city of Pergamum, Revelation says: \"where Satan's seat is\". Pergamum had a huge altar dedicated to Zeus. You can still see it today… in a museum in Berlin."),
    ], "awe"),
    ("cue", "aveugle"),
    ("say", "claude", [
        ("Imaginez tout un royaume dans le noir : plus de commerce, plus de fêtes, plus de parades militaires. Le pouvoir de la bête, qui éblouissait le monde entier, ne voit plus rien.",
         "Imagine a whole kingdom in the dark: no more trade, no more feasts, no more military parades. The beast's power, which dazzled the whole world, can no longer see a thing."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "egypte"),
    ("say", "claude", [
        ("Et ces ténèbres ont un modèle. Dans l'Exode, la neuvième plaie d'Égypte plonge le pays dans le noir pendant trois jours. Des ténèbres si épaisses, dit le texte, « qu'on pouvait les toucher ».",
         "And this darkness has a model. In Exodus, the ninth plague of Egypt plunges the land into darkness for three days. A darkness so thick, says the text, \"which may be felt\"."),
    ], "neutral"),
    ("cue", "goshen"),
    ("say", "claude", [
        ("Mais un détail change tout : pendant ce temps, là où vivaient les Israélites, il y avait de la lumière. Les ténèbres frappaient le royaume du pharaon, pas son peuple opprimé.",
         "But one detail changes everything: meanwhile, where the Israelites lived, there was light. The darkness struck Pharaoh's kingdom, not his oppressed people."),
    ], "awe"),
    ("cue", "croix"),
    ("say", "claude", [
        ("Et les Évangiles racontent aussi des ténèbres en plein jour : à la mort de Jésus, de midi à trois heures, il y eut des ténèbres sur toute la terre.",
         "And the Gospels also tell of darkness in broad daylight: at Jesus' death, from noon until three o'clock, there was darkness over all the land."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "douleur"),
    ("say", "voix", [
        ("« Et les hommes se mordaient la langue de douleur, et ils blasphémèrent le Dieu du ciel, à cause de leurs douleurs et de leurs ulcères, et ils ne se repentirent pas de leurs œuvres. »",
         "\"And they gnawed their tongues for pain, and blasphemed the God of heaven because of their pains and their sores, and repented not of their deeds.\""),
    ], "serious"),
    ("cue", "ulceres"),
    ("say", "claude", [
        ("Remarquez : leurs ulcères. Ce sont ceux de la première coupe. Les fléaux ne se remplacent pas, ils s'additionnent. Et dans le noir, la douleur paraît encore plus forte.",
         "Notice: their sores. They are the ones from the first bowl. The plagues don't replace each other, they add up. And in the dark, the pain feels even stronger."),
    ], "neutral"),
    ("cue", "refrain"),
    ("say", "claude", [
        ("Et puis il y a ce refrain, qui revient encore et encore dans ce chapitre : ils ne se repentirent pas. Le but de ces fléaux n'était pas seulement de punir, mais d'appeler à changer. Et personne ne change.",
         "And then there's that refrain, which comes back again and again in this chapter: they repented not. The aim of these plagues was not only to punish, but to call for change. And no one changes."),
    ], "awe"),
    ("cue", "pharaon"),
    ("say", "claude", [
        ("Exactement comme le pharaon d'Égypte qui, après chaque plaie, endurcissait son cœur un peu plus.",
         "Exactly like the Pharaoh of Egypt who, after every plague, hardened his heart a little more."),
    ], "serious"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, le quatrième ange verse sa coupe sur le soleil. Et le soleil se met à brûler les hommes, comme un feu. Ce sera le prochain épisode.",
         "But this story follows another one. Just before, the fourth angel pours out his bowl upon the sun. And the sun begins to scorch people, like fire. That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
