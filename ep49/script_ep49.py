# Episode 49 - Babylone coule comme une pierre (Apocalypse 18, 21-24) - on remonte la Bible scene par scene
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Un ange soulève une pierre aussi lourde qu'une meule de moulin… et la lance dans la mer. Ce geste, c'est le sort de toute une ville.",
         "An angel lifts a stone as heavy as a millstone… and hurls it into the sea. That gesture is the fate of an entire city."),
    ], "serious"),
    ("cue", "serie"),
    ("say", "claude", [
        ("On remonte la Bible, scène par scène. La dernière fois, le ciel entier criait Alléluia. Juste avant, voici pourquoi.",
         "We're going back through the Bible, scene by scene. Last time, all heaven cried Alleluia. Just before, here is why."),
    ], "neutral"),
    ("cue", "title"),
    ("title", "BABYLONE COULE\\NCOMME UNE PIERRE", "Babylon sinks like a stone", 2.8),
    ("pause", 2.6),

    ("scene", "meule"),
    ("say", "voix", [
        ("« Alors un ange puissant prit une pierre semblable à une grande meule, et il la jeta dans la mer, en disant : Ainsi sera précipitée avec violence Babylone, la grande ville, et elle ne sera plus trouvée. »",
         "\"And a mighty angel took up a stone like a great millstone, and cast it into the sea, saying, Thus with violence shall that great city Babylon be thrown down, and shall be found no more at all.\""),
    ], "serious"),
    ("cue", "poids"),
    ("say", "claude", [
        ("Une meule, c'est la grosse pierre ronde qui écrase le grain. Les plus grandes étaient tournées par un âne, et pesaient des centaines de kilos. Jetée à l'eau, elle ne remonte jamais.",
         "A millstone is the big round stone that grinds the grain. The largest were turned by a donkey, and weighed hundreds of kilos. Thrown into water, it never comes back up."),
    ], "neutral"),
    ("cue", "jeremie"),
    ("say", "claude", [
        ("Et ce geste a un modèle. Plus de six siècles plus tôt, le prophète Jérémie fait attacher une pierre à un livre, et le fait jeter dans l'Euphrate : « Ainsi Babylone sera submergée, elle ne se relèvera pas. »",
         "And this gesture has a model. More than six centuries earlier, the prophet Jeremiah has a stone tied to a book, and has it thrown into the Euphrates: \"Thus shall Babylon sink, and shall not rise.\""),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "rome"),
    ("say", "claude", [
        ("Mais quand Jean écrit, la vraie Babylone n'est déjà plus qu'une ville en ruine. Alors de qui parle-t-il ?",
         "But when John writes, the real Babylon is already little more than a ruined city. So who is he talking about?"),
    ], "serious"),
    ("cue", "collines"),
    ("say", "claude", [
        ("Beaucoup d'historiens pensent à Rome. L'Apocalypse dit que la femme est assise sur sept montagnes, et Rome est la ville aux sept collines.",
         "Many historians think of Rome. Revelation says the woman sits on seven mountains, and Rome is the city of seven hills."),
    ], "neutral"),
    ("cue", "pierre"),
    ("say", "claude", [
        ("Et dans la première lettre de Pierre, les chrétiens de Rome envoient déjà leurs salutations… depuis « Babylone ». Un nom de code. D'autres lecteurs y voient plutôt toute puissance qui se dresse contre Dieu.",
         "And in the first letter of Peter, the Christians of Rome already send their greetings… from \"Babylon\". A code name. Other readers see in it any power that rises up against God."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "silence"),
    ("say", "voix", [
        ("« Et l'on n'entendra plus chez toi les sons des joueurs de harpe, des musiciens, des joueurs de flûte et des joueurs de trompette, on ne trouvera plus chez toi aucun artisan, on n'entendra plus chez toi le bruit de la meule. »",
         "\"And the voice of harpers, and musicians, and of pipers, and trumpeters, shall be heard no more at all in thee; and no craftsman shall be found any more in thee; and the sound of a millstone shall be heard no more at all in thee.\""),
    ], "serious"),
    ("cue", "lampe"),
    ("say", "voix", [
        ("« La lumière de la lampe ne brillera plus chez toi, et la voix de l'époux et de l'épouse ne sera plus entendue chez toi. »",
         "\"And the light of a candle shall shine no more at all in thee; and the voice of the bridegroom and of the bride shall be heard no more at all in thee.\""),
    ], "serious"),
    ("cue", "eteint"),
    ("say", "claude", [
        ("Écoutez bien : la ville ne disparaît pas dans un grand bruit. Elle s'éteint, son après son. La musique, le travail, le pain, la lumière, et pour finir… les mariages.",
         "Listen closely: the city doesn't vanish with a great noise. It goes out, one sound after another. The music, the work, the bread, the light, and last of all… the weddings."),
    ], "serious"),
    ("cue", "jer25"),
    ("say", "claude", [
        ("Et cette liste aussi vient de Jérémie, presque mot pour mot : « Je ferai cesser les chants du fiancé et les chants de la fiancée, le bruit de la meule et la lumière de la lampe. »",
         "And this list also comes from Jeremiah, almost word for word: \"I will take from them the voice of the bridegroom, and the voice of the bride, the sound of the millstones, and the light of the candle.\""),
    ], "neutral"),
    ("cue", "noces"),
    ("say", "claude", [
        ("Babylone perd ses noces, juste avant que le ciel célèbre les noces de l'Agneau. C'était l'épisode quarante-huit.",
         "Babylon loses its weddings, just before heaven celebrates the marriage of the Lamb. That was episode forty-eight."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "raisons"),
    ("say", "voix", [
        ("« Parce que tes marchands étaient les grands de la terre, parce que toutes les nations ont été séduites par tes enchantements, et parce qu'on a trouvé chez elle le sang des prophètes et des saints. »",
         "\"For thy merchants were the great men of the earth; for by thy sorceries were all nations deceived. And in her was found the blood of prophets, and of saints.\""),
    ], "serious"),
    ("cue", "pharmakeia"),
    ("say", "claude", [
        ("Le mot grec traduit par « enchantements », c'est pharmakeia. Il a donné notre mot pharmacie. À l'époque, il voulait dire potions, drogues et sortilèges.",
         "The Greek word translated as \"sorceries\" is pharmakeia. It gave us our word pharmacy. At the time, it meant potions, drugs and spells."),
    ], "neutral"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, les rois et les marchands de la terre regardent de loin la grande ville brûler… et pleurent ce qu'ils ont perdu, en une seule heure. Ce sera le prochain épisode.",
         "But this story follows another one. Just before, the kings and merchants of the earth watch the great city burn from afar… and weep for what they lost, in a single hour. That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
