# Episode 22 - Neuf cerveaux, trois coeurs (la pieuvre)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "plongeuse": dict(voice="fr-CH-ArianeNeural", rate="+4%", pitch="+0Hz"),
    "soigneur": dict(voice="fr-CA-AntoineNeural", rate="+0%", pitch="+0Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.4),
    ("say", "claude", [
        ("Neuf cerveaux, trois cœurs, du sang bleu… et elle change de couleur en une fraction de seconde.",
         "Nine brains, three hearts, blue blood… and she changes colour in a split second."),
    ], "serious"),
    ("cue", "bienvenue"),
    ("say", "claude", [("Bienvenue chez l'animal le plus étrange de la mer : la pieuvre.", "Welcome to the strangest animal in the sea: the octopus.")], "happy"),
    ("cue", "title"),
    ("title", "NEUF CERVEAUX, TROIS CŒURS", "Nine brains, three hearts", 2.6),
    ("pause", 2.4),

    ("scene", "coeurs"),
    ("say", "claude", [
        ("Trois cœurs : deux envoient le sang dans les branchies, le troisième dans tout le corps.",
         "Three hearts: two pump blood through the gills, the third through the whole body."),
    ], "neutral"),
    ("cue", "bleu"),
    ("say", "claude", [
        ("Et ce sang est bleu. Chez nous, c'est le fer qui transporte l'oxygène ; chez elle, c'est le cuivre.",
         "And that blood is blue. In us, iron carries oxygen; in her, it's copper."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "cerveaux"),
    ("say", "claude", [
        ("Une pieuvre commune a environ 500 millions de neurones. Et à peu près les deux tiers sont… dans ses bras !",
         "A common octopus has about 500 million neurons. And roughly two thirds are… in its arms!"),
    ], "neutral"),
    ("cue", "neuf"),
    ("say", "claude", [
        ("D'où l'idée des « neuf cerveaux » : un au centre, et un paquet de neurones dans chaque bras. C'est une image, mais chaque bras peut agir en partie tout seul.",
         "Hence the idea of \"nine brains\": one in the centre, and a cluster of neurons in each arm. It's a figure of speech, but each arm can partly act on its own."),
    ], "neutral"),
    ("cue", "gout"),
    ("say", "claude", [
        ("Et ses ventouses goûtent ce qu'elles touchent. En 2020, des chercheurs de Harvard ont trouvé les récepteurs qui le permettent.",
         "And her suckers taste what they touch. In 2020, Harvard researchers found the receptors that make it possible."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "couleur"),
    ("say", "claude", [
        ("Sa peau est couverte de minuscules sacs de pigment, commandés par ses nerfs. Elle peut changer d'apparence en à peine deux dixièmes de seconde.",
         "Her skin is covered in tiny pigment sacs, controlled by her nerves. She can change her look in barely two tenths of a second."),
    ], "neutral"),
    ("cue", "aveugle"),
    ("say", "claude", [
        ("Le plus fou ? Ses yeux n'ont qu'un seul type de récepteur de lumière. Elle ne verrait donc pas les couleurs… et pourtant, elle les imite.",
         "The craziest part? Her eyes have only one type of light receptor. So she probably can't see colours… and yet she copies them."),
    ], "serious"),
    ("cue", "hypo"),
    ("say", "claude", [
        ("Peut-être que sa peau sent la lumière. Peut-être que la forme de sa pupille l'aide. Ce sont des hypothèses : le mystère reste ouvert.",
         "Maybe her skin senses light. Maybe the shape of her pupil helps. These are hypotheses: the mystery remains open."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "coco"),
    ("say", "claude", [
        ("En 2009, des biologistes publient des images étonnantes, filmées en Indonésie : une pieuvre ramasse des coques de noix de coco… et les transporte pour s'en faire un abri.",
         "In 2009, biologists publish amazing footage filmed in Indonesia: an octopus picks up coconut shells… and carries them to build itself a shelter."),
    ], "neutral"),
    ("cue", "plongeuse"),
    ("say", "plongeuse", [("Elle emporte sa maison avec elle !", "She's taking her house with her!")], "joy"),
    ("pause", 0.3),

    ("scene", "inky"),
    ("date", "2016 · Aquarium national de Nouvelle-Zélande", "2016 · National Aquarium of New Zealand", 2.8),
    ("pause", 0.5),
    ("say", "claude", [
        ("Et en 2016, en Nouvelle-Zélande, une pieuvre nommée Inki sort de son aquarium pendant la nuit, traverse la pièce, et se glisse dans un tuyau de quinze centimètres… direction l'océan.",
         "And in 2016, in New Zealand, an octopus named Inky gets out of its tank at night, crosses the room, and slips into a fifteen-centimetre pipe… heading for the ocean."),
    ], "neutral"),
    ("cue", "soigneur"),
    ("say", "soigneur", [("Inki ? … Inki est parti !", "Inky? … Inky's gone!")], "awe"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("Pourtant, la plupart des pieuvres ne vivent qu'un ou deux ans. Et dans les grands fonds, une mère a veillé sur ses œufs pendant quatre ans et demi : un record dans le monde animal.",
         "Yet most octopuses live only one or two years. And in the deep sea, one mother watched over her eggs for four and a half years: a record in the animal kingdom."),
    ], "neutral"),
    ("cue", "question"),
    ("say", "claude", [
        ("Et toi, si tu pouvais avoir un pouvoir de la pieuvre : changer de couleur, goûter avec les mains, ou passer par un trou de quinze centimètres ? Dis-le-moi en commentaire.",
         "And you, if you could have one octopus power: changing colour, tasting with your hands, or squeezing through a fifteen-centimetre hole? Tell me in the comments."),
    ], "happy"),
    ("pause", 1.6),
]
