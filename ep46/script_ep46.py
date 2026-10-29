# Episode 46 - Un ange enchaine le dragon (Apocalypse 20, 1-6) - on remonte la Bible scene par scene
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Un seul ange. Une clé, une chaîne. Et en face, le plus grand ennemi de toute la Bible… qui ne résiste même pas.",
         "A single angel. A key, a chain. And facing him, the greatest enemy in the whole Bible… who doesn't even resist."),
    ], "serious"),
    ("cue", "serie"),
    ("say", "claude", [
        ("On remonte la Bible, scène par scène. La dernière fois, Satan sortait de sa prison. Juste avant, on découvre comment il y était entré.",
         "We're going back through the Bible, scene by scene. Last time, Satan came out of his prison. Just before, we discover how he got there."),
    ], "happy"),
    ("cue", "title"),
    ("title", "UN ANGE ENCHAÎNE\\NLE DRAGON", "An angel chains the dragon", 2.8),
    ("pause", 2.6),

    ("scene", "chaine"),
    ("say", "voix", [
        ("« Puis je vis descendre du ciel un ange, qui avait la clef de l'abîme et une grande chaîne dans sa main. Il saisit le dragon, le serpent ancien, qui est le diable et Satan, et il le lia pour mille ans. »",
         "\"And I saw an angel come down from heaven, having the key of the bottomless pit and a great chain in his hand. And he laid hold on the dragon, that old serpent, which is the Devil, and Satan, and bound him a thousand years.\""),
    ], "serious"),
    ("cue", "noms"),
    ("say", "claude", [
        ("Quatre noms pour un seul ennemi. Le dragon, celui de l'Apocalypse. Le serpent ancien, celui du jardin d'Éden.",
         "Four names for a single enemy. The dragon, the one from Revelation. The old serpent, the one from the garden of Eden."),
    ], "neutral"),
    ("cue", "diable"),
    ("say", "claude", [
        ("Le diable, du grec diabolos : celui qui divise, qui accuse. Et Satan, un mot hébreu qui veut dire : l'adversaire.",
         "The devil, from the Greek diabolos: the one who divides, who accuses. And Satan, a Hebrew word meaning: the adversary."),
    ], "neutral"),
    ("cue", "simple"),
    ("say", "claude", [
        ("Et remarquez : pas de combat. Ce n'est même pas un archange, juste un ange. Il saisit, il attache, c'est tout.",
         "And notice: no fight. It's not even an archangel, just an angel. He seizes, he binds, that's all."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "abime"),
    ("say", "voix", [
        ("« Il le jeta dans l'abîme, ferma et scella l'entrée au-dessus de lui, afin qu'il ne séduisît plus les nations, jusqu'à ce que les mille ans fussent accomplis. Après cela, il faut qu'il soit délié pour un peu de temps. »",
         "\"And cast him into the bottomless pit, and shut him up, and set a seal upon him, that he should deceive the nations no more, till the thousand years should be fulfilled: and after that he must be loosed a little season.\""),
    ], "serious"),
    ("cue", "abyssos"),
    ("say", "claude", [
        ("L'abîme, en grec abyssos, veut dire : sans fond. Dans l'Apocalypse, c'est un puits d'où sortaient déjà des nuées de sauterelles et la bête.",
         "The abyss, in Greek abyssos, means: bottomless. In Revelation, it is a pit from which swarms of locusts and the beast had already come out."),
    ], "neutral"),
    ("cue", "sceau"),
    ("say", "claude", [
        ("Le sceau, c'est un cachet de cire : si quelqu'un l'ouvre, tout le monde le voit. On a scellé la fosse aux lions de Daniel… et le tombeau de Jésus.",
         "The seal is a wax stamp: if anyone opens it, everyone can see. The lions' den of Daniel was sealed… and so was the tomb of Jesus."),
    ], "neutral"),
    ("cue", "an1000"),
    ("say", "claude", [
        ("C'est de ce passage que vient le mot millénium. On raconte qu'en l'an mille, l'Europe aurait tremblé de peur. Mais les historiens pensent que ces « terreurs de l'an mil » ont été largement exagérées, bien plus tard.",
         "The word millennium comes from this passage. It is said that in the year 1000, Europe trembled with fear. But historians think these \"terrors of the year 1000\" were largely exaggerated, much later."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "trones"),
    ("say", "voix", [
        ("« Et je vis des trônes ; et à ceux qui s'y assirent fut donné le pouvoir de juger. »",
         "\"And I saw thrones, and they sat upon them, and judgment was given unto them.\""),
    ], "serious"),
    ("cue", "daniel"),
    ("say", "claude", [
        ("Encore un écho du prophète Daniel, qui avait vu le jour où « le jugement fut donné aux saints du Très-Haut ».",
         "Another echo of the prophet Daniel, who had seen the day when \"judgment was given to the saints of the most High\"."),
    ], "neutral"),
    ("cue", "qui"),
    ("say", "claude", [
        ("Qui sont-ils ? Jean voit les âmes de ceux qui ont été tués pour être restés fidèles à Jésus, et de ceux qui n'ont pas adoré la bête ni reçu sa marque sur le front ou sur la main.",
         "Who are they? John sees the souls of those who were killed for staying faithful to Jesus, and of those who had not worshipped the beast nor received its mark on their forehead or hand."),
    ], "neutral"),
    ("cue", "marque"),
    ("say", "claude", [
        ("La marque de la bête… avec son nombre, six cent soixante-six. Nous y arriverons en remontant le livre.",
         "The mark of the beast… with its number, six hundred and sixty-six. We'll get there as we go back through the book."),
    ], "serious"),
    ("say", "voix", [
        ("« Ils revinrent à la vie, et ils régnèrent avec Christ pendant mille ans. C'est la première résurrection. »",
         "\"And they lived and reigned with Christ a thousand years. This is the first resurrection.\""),
    ], "serious"),
    ("cue", "premiere"),
    ("say", "claude", [
        ("Ceux que le monde avait vaincus sont maintenant assis sur des trônes. C'est le grand renversement de l'Apocalypse.",
         "Those the world had defeated are now seated on thrones. It's the great reversal of Revelation."),
    ], "awe"),
    ("say", "voix", [
        ("« Heureux et saints ceux qui ont part à la première résurrection ! La seconde mort n'a point de pouvoir sur eux. »",
         "\"Blessed and holy is he that hath part in the first resurrection: on such the second death hath no power.\""),
    ], "happy"),
    ("cue", "seconde"),
    ("say", "claude", [
        ("La seconde mort, celle de l'étang de feu, vue deux épisodes plus tôt, ne peut plus rien contre eux.",
         "The second death, the lake of fire we saw two episodes ago, can no longer do anything against them."),
    ], "neutral"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, le ciel s'ouvre. Un cavalier apparaît sur un cheval blanc. Ses yeux sont comme une flamme de feu… et il porte un nom que personne ne connaît. Ce sera le prochain épisode.",
         "But this story follows another one. Just before, heaven opens. A rider appears on a white horse. His eyes are like a flame of fire… and he bears a name no one knows. That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
