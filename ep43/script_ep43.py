# Episode 43 - Dieu essuie toute larme (Apocalypse 21, 1-8) - on remonte la Bible scene par scene
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
    "trone": dict(voice="fr-FR-HenriNeural", rate="-12%", pitch="-10Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Le ciel disparaît. La terre disparaît. Et même la mer… n'existe plus. Pourtant, c'est peut-être la scène la plus douce de toute la Bible.",
         "The sky disappears. The earth disappears. And even the sea… is no more. And yet, it may be the gentlest scene in the whole Bible."),
    ], "serious"),
    ("cue", "serie"),
    ("say", "claude", [
        ("On remonte la Bible, scène par scène. La dernière fois, une ville d'or descendait du ciel. Juste avant, Jean voit le monde entier changer.",
         "We're going back through the Bible, scene by scene. Last time, a city of gold came down from heaven. Just before, John sees the whole world change."),
    ], "happy"),
    ("cue", "title"),
    ("title", "DIEU ESSUIE\\NTOUTE LARME", "God wipes away every tear", 2.8),
    ("pause", 2.6),

    ("scene", "mer"),
    ("say", "claude", [
        ("Jean écrit depuis Patmos, une petite île de la mer Égée où il a été exilé. Il raconte :",
         "John writes from Patmos, a small island in the Aegean Sea where he has been exiled. He says:"),
    ], "neutral"),
    ("say", "voix", [
        ("« Puis je vis un nouveau ciel et une nouvelle terre ; car le premier ciel et la première terre avaient disparu, et la mer n'était plus. »",
         "\"And I saw a new heaven and a new earth: for the first heaven and the first earth were passed away; and there was no more sea.\""),
    ], "serious"),
    ("cue", "chaos"),
    ("say", "claude", [
        ("Pourquoi la mer ? Dans la Bible, elle fait peur. Au début de la Genèse, avant la création, il n'y a que l'abîme et les eaux.",
         "Why the sea? In the Bible, it is frightening. At the start of Genesis, before creation, there is only the deep and the waters."),
    ], "neutral"),
    ("cue", "bete"),
    ("say", "claude", [
        ("Et dans l'Apocalypse, c'est de la mer que sort la bête. Pour Jean, c'est aussi ce qui le sépare des siens. Plus de mer : plus de chaos, plus de séparation.",
         "And in Revelation, it is from the sea that the beast rises. For John, it is also what separates him from his people. No more sea: no more chaos, no more separation."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "tente"),
    ("say", "voix", [
        ("« Et je vis descendre du ciel, d'auprès de Dieu, la ville sainte, la nouvelle Jérusalem, préparée comme une épouse qui s'est parée pour son époux. »",
         "\"And I John saw the holy city, new Jerusalem, coming down from God out of heaven, prepared as a bride adorned for her husband.\""),
    ], "serious"),
    ("cue", "forte"),
    ("say", "claude", [
        ("C'est la ville de l'épisode précédent. Puis une forte voix sort du trône :",
         "It's the city from the previous episode. Then a loud voice comes from the throne:"),
    ], "neutral"),
    ("say", "voix", [
        ("« Voici le tabernacle de Dieu avec les hommes ! Il habitera avec eux, et ils seront son peuple, et Dieu lui-même sera avec eux. »",
         "\"Behold, the tabernacle of God is with men, and he will dwell with them, and they shall be his people, and God himself shall be with them.\""),
    ], "serious"),
    ("cue", "desert"),
    ("say", "claude", [
        ("Le tabernacle, c'est la tente que les Hébreux dressaient dans le désert, au centre du camp, pour que Dieu habite au milieu de son peuple. Seul le grand prêtre pouvait entrer dans le lieu très saint.",
         "The tabernacle is the tent the Hebrews pitched in the desert, at the centre of the camp, so that God could dwell among his people. Only the high priest could enter the Most Holy Place."),
    ], "neutral"),
    ("cue", "partout"),
    ("say", "claude", [
        ("Ici, il n'y a plus de rideau : Dieu habite avec tout le monde.",
         "Here, there is no more curtain: God dwells with everyone."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "larmes"),
    ("say", "voix", [
        ("« Il essuiera toute larme de leurs yeux, et la mort ne sera plus, et il n'y aura plus ni deuil, ni cri, ni douleur, car les premières choses ont disparu. »",
         "\"And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.\""),
    ], "serious"),
    ("cue", "geste"),
    ("say", "claude", [
        ("Regardez le geste. Dieu ne dit pas seulement : « Ne pleurez plus ». Il essuie lui-même les larmes, une par une, comme on le fait pour un enfant.",
         "Look at the gesture. God doesn't just say: \"Stop crying\". He wipes the tears himself, one by one, as you would for a child."),
    ], "happy"),
    ("cue", "isaie"),
    ("say", "claude", [
        ("Et c'est une promesse ancienne : sept siècles plus tôt, le prophète Isaïe annonçait déjà un jour où Dieu essuierait les larmes de tous les visages.",
         "And it's an ancient promise: seven centuries earlier, the prophet Isaiah already foretold a day when God would wipe the tears from all faces."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "trone"),
    ("say", "claude", [
        ("Puis, pour la première fois depuis longtemps dans le livre, c'est celui qui est assis sur le trône qui parle lui-même.",
         "Then, for the first time in a long while in the book, it is the one seated on the throne who speaks himself."),
    ], "awe"),
    ("say", "trone", [
        ("« Voici, je fais toutes choses nouvelles. C'est fait ! Je suis l'alpha et l'oméga, le commencement et la fin. »",
         "\"Behold, I make all things new. It is done. I am Alpha and Omega, the beginning and the end.\""),
    ], "serious"),
    ("cue", "alpha"),
    ("say", "claude", [
        ("L'alpha et l'oméga, c'est la première et la dernière lettre de l'alphabet grec. Comme si l'on disait : de A à Z.",
         "Alpha and omega are the first and last letters of the Greek alphabet. As if to say: from A to Z."),
    ], "neutral"),
    ("cue", "source"),
    ("say", "trone", [
        ("« À celui qui a soif je donnerai de la source de l'eau de la vie, gratuitement. »",
         "\"I will give unto him that is athirst of the fountain of the water of life freely.\""),
    ], "serious"),
    ("cue", "gratuit"),
    ("say", "claude", [
        ("Gratuitement : le mot est important. Rien à payer, rien à mériter.",
         "Freely: the word matters. Nothing to pay, nothing to earn."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "ombre"),
    ("say", "claude", [
        ("Le passage se termine pourtant sur une ombre. Le texte dresse une liste : les lâches, les meurtriers, les idolâtres, les menteurs…",
         "Yet the passage ends on a shadow. The text draws up a list: the cowardly, the murderers, the idolaters, the liars…"),
    ], "serious"),
    ("cue", "etang"),
    ("say", "voix", [
        ("« Leur part sera dans l'étang ardent de feu et de soufre, ce qui est la seconde mort. »",
         "\"They shall have their part in the lake which burneth with fire and brimstone: which is the second death.\""),
    ], "serious"),
    ("cue", "seconde"),
    ("say", "claude", [
        ("La seconde mort. Une expression qu'on ne trouve que dans l'Apocalypse, et qui est expliquée dans la scène juste avant.",
         "The second death. An expression found only in Revelation, and it is explained in the scene just before."),
    ], "neutral"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, Jean voit un grand trône blanc. Devant lui, le ciel et la terre s'enfuient. Les morts, grands et petits, se tiennent debout… et des livres s'ouvrent. Ce sera le prochain épisode.",
         "But this story follows another one. Just before, John sees a great white throne. Before it, the heaven and the earth flee away. The dead, small and great, stand… and books are opened. That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
