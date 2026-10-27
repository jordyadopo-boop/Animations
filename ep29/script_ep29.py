# Episode 29 - L'animal presque indestructible (les tardigrades)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "goeze": dict(voice="fr-CH-FabriceNeural", rate="+0%", pitch="-4Hz"),
    "cherch": dict(voice="fr-BE-CharlineNeural", rate="+0%", pitch="+0Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.4),
    ("say", "claude", [
        ("Il survit au vide de l'espace, à moins 272 degrés, à des radiations des centaines de fois mortelles pour nous… et il mesure moins d'un millimètre.",
         "It survives the vacuum of space, minus 272 degrees, radiation hundreds of times deadly to us… and it's less than a millimetre long."),
    ], "serious"),
    ("cue", "title"),
    ("title", "L'ANIMAL PRESQUE INDESTRUCTIBLE", "The almost indestructible animal", 2.8),
    ("pause", 2.7),

    ("scene", "goeze"),
    ("date", "1773 · Allemagne", "1773 · Germany", 2.6),
    ("pause", 0.4),
    ("say", "claude", [
        ("Un pasteur passionné de microscope, Johann Gueutsé, découvre une minuscule bête à huit pattes, qui marche lentement comme un ours.",
         "A pastor who loves his microscope, Johann Goeze, discovers a tiny eight-legged creature that walks slowly like a bear."),
    ], "neutral"),
    ("cue", "goeze_dit"),
    ("say", "goeze", [("Je l'appellerai… le petit ours d'eau.", "I shall call it… the little water bear.")], "happy"),
    ("cue", "nom"),
    ("say", "claude", [
        ("Quelques années plus tard, on leur donne le nom de tardigrades : « ceux qui marchent lentement ».",
         "A few years later, they get the name tardigrades: \"the slow walkers\"."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "portrait"),
    ("say", "claude", [
        ("Huit pattes à griffes, une bouche en forme de tube, souvent moins d'un demi-millimètre. On connaît environ 1 500 espèces.",
         "Eight clawed legs, a tube-shaped mouth, often less than half a millimetre. About 1,500 species are known."),
    ], "happy"),
    ("cue", "partout"),
    ("say", "claude", [
        ("Et ils vivent partout : dans la mousse de ton jardin, en haut des montagnes, au fond des océans, et même en Antarctique.",
         "And they live everywhere: in the moss in your garden, on mountaintops, at the bottom of the oceans, and even in Antarctica."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "tonnelet"),
    ("say", "claude", [
        ("Leur secret ? Quand tout sèche, le tardigrade rentre ses pattes, se recroqueville en petit tonnelet… et son corps s'arrête presque complètement.",
         "Their secret? When everything dries out, the tardigrade pulls in its legs, curls up into a tiny barrel… and its body almost completely shuts down."),
    ], "serious"),
    ("cue", "goutte"),
    ("say", "cherch", [("Une goutte d'eau… et regarde : il se réveille.", "A drop of water… and look: it wakes up.")], "happy"),
    ("pause", 0.3),

    ("scene", "records"),
    ("say", "claude", [
        ("En tonnelet, il a encaissé en laboratoire un froid proche du zéro absolu, environ 150 degrés pendant quelques minutes, et une pression six mille fois plus forte que l'air.",
         "As a barrel, in the lab it has withstood cold close to absolute zero, about 150 degrees for a few minutes, and a pressure six thousand times that of air."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "espace"),
    ("date", "2007 · en orbite", "2007 · in orbit", 2.4),
    ("pause", 0.3),
    ("say", "claude", [
        ("En 2007, des tardigrades séchés passent dix jours dans le vide de l'espace, accrochés à l'extérieur d'une capsule. De retour sur Terre, beaucoup se réveillent… et pondent des œufs.",
         "In 2007, dried tardigrades spend ten days in the vacuum of space, attached to the outside of a capsule. Back on Earth, many wake up… and lay eggs."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "dsup"),
    ("say", "claude", [
        ("En 2016, des chercheurs japonais trouvent une de leurs armes : une protéine baptisée Dé-Sup, qui protège leur ADN des radiations.",
         "In 2016, Japanese researchers find one of their weapons: a protein named Dsup, which shields their DNA from radiation."),
    ], "neutral"),
    ("cue", "glace"),
    ("say", "claude", [
        ("La même année, au Japon, des tardigrades restés trente ans congelés dans de la mousse de l'Antarctique se réveillent… et ont des petits.",
         "That same year, in Japan, tardigrades kept frozen for thirty years in Antarctic moss wake up… and have babies."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "nuance"),
    ("say", "claude", [
        ("Mais attention : réveillés, ils sont fragiles. Chez une espèce testée, la moitié meurt après une journée à 37 degrés. Leur super-pouvoir, c'est de savoir s'arrêter.",
         "But careful: awake, they're fragile. In one species tested, half die after a day at 37 degrees. Their superpower is knowing how to shut down."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("Et toi, si tu pouvais avoir un seul de leurs pouvoirs : résister au froid, à l'espace, ou aux radiations ? Dis-le-moi en commentaire.",
         "And you, if you could have just one of their powers: resisting cold, space, or radiation? Tell me in the comments."),
    ], "happy"),
    ("pause", 1.6),
]
