# Episode 41 - L'arbre de vie est de retour (Apocalypse 22, 1-5) - on remonte la Bible scene par scene
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("À la première page de la Bible, un arbre est gardé par des chérubins et une épée de feu, pour que personne ne s'en approche. Pendant plus de mille pages, il disparaît… jusqu'à aujourd'hui.",
         "On the first page of the Bible, a tree is guarded by cherubim and a flaming sword, so that no one can come near it. For over a thousand pages, it disappears… until today."),
    ], "serious"),
    ("cue", "serie"),
    ("say", "claude", [
        ("On remonte la Bible, scène par scène. La dernière fois, un ange refusait d'être adoré. Juste avant, ce même ange montre à Jean un endroit extraordinaire.",
         "We're going back through the Bible, scene by scene. Last time, an angel refused to be worshipped. Just before, that same angel shows John an extraordinary place."),
    ], "happy"),
    ("cue", "title"),
    ("title", "L'ARBRE DE VIE\\NEST DE RETOUR", "The tree of life is back", 2.8),
    ("pause", 2.6),

    ("scene", "fleuve"),
    ("say", "claude", [
        ("Jean est en pleine vision, dans une ville immense descendue du ciel. Il raconte :",
         "John is in the middle of his vision, in an immense city come down from heaven. He says:"),
    ], "neutral"),
    ("say", "voix", [
        ("« Et il me montra un fleuve d'eau de la vie, limpide comme du cristal, qui sortait du trône de Dieu et de l'agneau. »",
         "\"And he shewed me a pure river of water of life, clear as crystal, proceeding out of the throne of God and of the Lamb.\""),
    ], "serious"),
    ("cue", "agneau"),
    ("say", "claude", [
        ("L'agneau, dans l'Apocalypse, c'est l'image de Jésus. Et ce fleuve n'arrive pas de nulle part : dans la Genèse, déjà, un fleuve sortait du jardin d'Éden pour l'arroser. Et le prophète Ézéchiel avait vu, lui aussi, un fleuve jaillir du Temple et faire revivre tout ce qu'il touchait.",
         "The Lamb, in Revelation, is the image of Jesus. And this river doesn't come out of nowhere: in Genesis, a river already flowed out of the Garden of Eden to water it. And the prophet Ezekiel had also seen a river burst from the Temple and bring back to life everything it touched."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "arbre"),
    ("say", "voix", [
        ("« Sur les deux bords du fleuve, il y avait un arbre de vie, produisant douze fois des fruits, rendant son fruit chaque mois, et dont les feuilles servaient à la guérison des nations. »",
         "\"On either side of the river, was there the tree of life, which bare twelve manner of fruits, and yielded her fruit every month: and the leaves of the tree were for the healing of the nations.\""),
    ], "serious"),
    ("cue", "eden"),
    ("say", "claude", [
        ("C'est le grand retournement de la Bible. Dans la Genèse, après la faute d'Adam et Ève, Dieu les chasse du jardin et place des chérubins pour garder le chemin de l'arbre de vie. Ici, l'arbre est de retour, au milieu de la ville… et plus personne ne le garde.",
         "This is the great reversal of the Bible. In Genesis, after Adam and Eve's fault, God drives them out of the garden and places cherubim to guard the way to the tree of life. Here, the tree is back, in the middle of the city… and no one guards it anymore."),
    ], "awe"),
    ("cue", "douze"),
    ("say", "claude", [
        ("Un fruit chaque mois, douze récoltes par an : jamais d'hiver, jamais de faim. Et ses feuilles soignent tous les peuples.",
         "A fruit every month, twelve harvests a year: never winter, never hunger. And its leaves heal all peoples."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "face"),
    ("say", "voix", [
        ("« Il n'y aura plus d'anathème. Le trône de Dieu et de l'agneau sera dans la ville ; ses serviteurs le serviront et verront sa face, et son nom sera sur leurs fronts. »",
         "\"And there shall be no more curse: but the throne of God and of the Lamb shall be in it; and his servants shall serve him: and they shall see his face; and his name shall be in their foreheads.\""),
    ], "serious"),
    ("cue", "moise"),
    ("say", "claude", [
        ("Plus d'anathème, c'est-à-dire plus de malédiction : celle qui pesait sur la terre depuis le jardin d'Éden est levée. Et voir la face de Dieu… même Moïse n'en avait pas eu le droit. Dans l'Exode, Dieu lui dit : « L'homme ne peut me voir et vivre. » Ici, c'est enfin possible.",
         "No more curse: the one that weighed on the earth since the Garden of Eden is lifted. And seeing God's face… even Moses hadn't been allowed that. In Exodus, God tells him: \"There shall no man see me, and live.\" Here, it's finally possible."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "nuit"),
    ("say", "voix", [
        ("« Il n'y aura plus de nuit ; et ils n'auront besoin ni de lampe ni de lumière, parce que le Seigneur Dieu les éclairera. Et ils régneront aux siècles des siècles. »",
         "\"And there shall be no night there; and they need no candle, neither light of the sun; for the Lord God giveth them light: and they shall reign for ever and ever.\""),
    ], "serious"),
    ("cue", "soleil"),
    ("say", "claude", [
        ("Dans la Genèse, au tout début, Dieu sépare le jour de la nuit. Ici, à la fin, la nuit n'existe plus. La Bible se referme comme elle s'est ouverte : avec de la lumière, un jardin… et un arbre.",
         "In Genesis, at the very beginning, God separates day from night. Here, at the end, night no longer exists. The Bible closes the way it opened: with light, a garden… and a tree."),
    ], "happy"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, un ange mesure une ville d'or pur, transparente comme du verre, avec un roseau d'or. Ses murailles sont faites de pierres précieuses… et chacune de ses portes est taillée dans une seule perle. Ce sera le prochain épisode.",
         "But this story follows another one. Just before, an angel measures a city of pure gold, as clear as glass, with a golden reed. Its walls are made of precious stones… and each of its gates is carved from a single pearl. That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
