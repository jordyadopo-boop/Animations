# Episode 57 - Un soleil de feu (Apocalypse 16, 8-9) - on remonte la Bible scene par scene
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Le soleil, celui qui fait vivre toute la terre… se met soudain à la brûler. Un ange verse sa coupe directement dessus.",
         "The sun, the one that gives life to the whole earth… suddenly begins to burn it. An angel pours his bowl straight onto it."),
    ], "serious"),
    ("cue", "serie"),
    ("say", "claude", [
        ("On remonte la Bible, scène par scène. La dernière fois, le royaume de la bête plongeait dans les ténèbres. Juste avant, c'est tout l'inverse : une lumière qui brûle.",
         "We're going back through the Bible, scene by scene. Last time, the beast's kingdom plunged into darkness. Just before, it's the exact opposite: a light that burns."),
    ], "neutral"),
    ("cue", "title"),
    ("title", "UN SOLEIL\\NDE FEU", "A sun of fire", 2.8),
    ("pause", 2.6),

    ("scene", "coupe"),
    ("say", "voix", [
        ("« Le quatrième versa sa coupe sur le soleil. Et il lui fut donné de brûler les hommes par le feu. »",
         "\"And the fourth angel poured out his vial upon the sun; and power was given unto him to scorch men with fire.\""),
    ], "serious"),
    ("cue", "trompette"),
    ("say", "claude", [
        ("Un peu plus tôt dans l'Apocalypse, à la quatrième trompette, un tiers du soleil s'obscurcissait. Ici, c'est le contraire : le soleil devient trop fort.",
         "A little earlier in Revelation, at the fourth trumpet, a third of the sun was darkened. Here, it's the opposite: the sun becomes too strong."),
    ], "neutral"),
    ("cue", "genese"),
    ("say", "claude", [
        ("Petit clin d'œil : dans la Genèse, le soleil est créé le quatrième jour. Et c'est la quatrième coupe qui le frappe.",
         "A little wink: in Genesis, the sun is created on the fourth day. And it's the fourth bowl that strikes it."),
    ], "happy"),
    ("cue", "chiffres"),
    ("say", "claude", [
        ("Et pourtant, le soleil est déjà un monstre : cinq mille cinq cents degrés à sa surface, quinze millions de degrés en son cœur. Il suffirait d'un tout petit déséquilibre pour que la vie devienne impossible.",
         "And yet the sun is already a monster: five thousand five hundred degrees at its surface, fifteen million degrees at its core. The tiniest imbalance would make life impossible."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "culte"),
    ("say", "claude", [
        ("Pour les anciens, frapper le soleil, c'était frapper un dieu. Les Égyptiens adoraient Râ, le dieu-soleil. Et à Rome, Néron s'était fait représenter en dieu-soleil, sur une statue géante de plus de trente mètres : le Colosse.",
         "For the ancients, striking the sun meant striking a god. The Egyptians worshipped Ra, the sun god. And in Rome, Nero had himself depicted as the sun god, on a giant statue more than thirty metres tall: the Colossus."),
    ], "neutral"),
    ("cue", "akhenaton"),
    ("say", "claude", [
        ("Un pharaon, Akhenaton, avait même tenté d'imposer un seul dieu à toute l'Égypte : Aton, le disque du soleil.",
         "One pharaoh, Akhenaten, even tried to impose a single god on all of Egypt: Aten, the disc of the sun."),
    ], "neutral"),
    ("cue", "colisee"),
    ("say", "claude", [
        ("Cette statue était si célèbre que l'amphithéâtre construit juste à côté a fini par prendre son nom : le Colisée. Et deux siècles plus tard, l'empereur Aurélien fera du Soleil invaincu le dieu officiel de l'Empire.",
         "That statue was so famous that the amphitheatre built right next to it ended up taking its name: the Colosseum. And two centuries later, the emperor Aurelian would make the Unconquered Sun the official god of the Empire."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "chaleur"),
    ("say", "voix", [
        ("« Et les hommes furent brûlés par une grande chaleur, et ils blasphémèrent le nom du Dieu qui a l'autorité sur ces fléaux, et ils ne se repentirent pas pour lui donner gloire. »",
         "\"And men were scorched with great heat, and blasphemed the name of God, which hath power over these plagues: and they repented not to give him glory.\""),
    ], "serious"),
    ("cue", "record"),
    ("say", "claude", [
        ("Pour imaginer : la température officiellement la plus haute jamais relevée sur terre est de cinquante-six degrés, dans la Vallée de la Mort, aux États-Unis. Ici, la chaleur brûle comme un feu.",
         "To picture it: the highest temperature ever officially recorded on earth is fifty-six degrees, in Death Valley, in the United States. Here, the heat burns like fire."),
    ], "neutral"),
    ("cue", "matthieu"),
    ("say", "claude", [
        ("Jésus disait que Dieu fait lever son soleil sur les méchants et sur les bons. Ce cadeau offert à tous devient ici un fléau.",
         "Jesus said that God makes his sun rise on the evil and on the good. This gift offered to all becomes a plague here."),
    ], "serious"),
    ("cue", "gloire"),
    ("say", "claude", [
        ("Et regardez ce détail : ils savent très bien qui a l'autorité sur ces fléaux. Ils ne nient pas Dieu… ils le maudissent. Ailleurs dans l'Apocalypse, après un séisme, les survivants rendaient gloire à Dieu. Ici, personne.",
         "And look at this detail: they know very well who has power over these plagues. They don't deny God… they curse him. Elsewhere in Revelation, after an earthquake, the survivors gave glory to God. Here, no one."),
    ], "awe"),
    ("cue", "promesse"),
    ("say", "claude", [
        ("Et pour ceux qui restent fidèles, l'Apocalypse fait une promesse inverse : « Le soleil ne les frappera point, ni aucune chaleur. » Un écho du Psaume : « Le soleil ne te frappera point pendant le jour. »",
         "And for those who stay faithful, Revelation makes the opposite promise: \"neither shall the sun light on them, nor any heat.\" An echo of the Psalm: \"The sun shall not smite thee by day.\""),
    ], "neutral"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, le troisième ange verse sa coupe sur les fleuves et les sources. Et l'eau devient du sang. Ce sera le prochain épisode.",
         "But this story follows another one. Just before, the third angel pours out his bowl upon the rivers and springs. And the water turns to blood. That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
