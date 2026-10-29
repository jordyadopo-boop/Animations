# Episode 45 - Satan sort de sa prison (Apocalypse 20, 7-10) - on remonte la Bible scene par scene
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Mille ans de prison. Puis la porte s'ouvre. Il rassemble une armée aussi nombreuse que le sable de la mer… et la bataille finale tient en une seule phrase.",
         "A thousand years in prison. Then the door opens. He gathers an army as numerous as the sand of the sea… and the final battle fits in a single sentence."),
    ], "serious"),
    ("cue", "serie"),
    ("say", "claude", [
        ("On remonte la Bible, scène par scène. La dernière fois, la mort elle-même était jetée au feu. Juste avant, un prisonnier très ancien retrouve sa liberté.",
         "We're going back through the Bible, scene by scene. Last time, death itself was thrown into the fire. Just before, a very ancient prisoner regains his freedom."),
    ], "happy"),
    ("cue", "title"),
    ("title", "SATAN SORT\\NDE SA PRISON", "Satan comes out of his prison", 2.8),
    ("pause", 2.6),

    ("scene", "prison"),
    ("say", "voix", [
        ("« Quand les mille ans seront accomplis, Satan sera relâché de sa prison. »",
         "\"And when the thousand years are expired, Satan shall be loosed out of his prison.\""),
    ], "serious"),
    ("cue", "millenaire"),
    ("say", "claude", [
        ("Ces mille ans font débattre les lecteurs depuis deux mille ans. Pour certains, c'est un vrai règne de mille ans sur terre, encore à venir.",
         "These thousand years have divided readers for two thousand years. For some, it is a real thousand-year reign on earth, still to come."),
    ], "neutral"),
    ("cue", "augustin"),
    ("say", "claude", [
        ("Pour d'autres, comme saint Augustin, c'est un symbole : le long temps de l'Église, entre la venue de Jésus et la fin.",
         "For others, like Saint Augustine, it is a symbol: the long age of the Church, between Jesus's coming and the end."),
    ], "neutral"),
    ("cue", "pourquoi"),
    ("say", "claude", [
        ("Et pourquoi le relâcher ? Le texte ne l'explique pas. Il dit seulement, un peu plus haut, qu'il doit être relâché pour un peu de temps.",
         "And why release him? The text doesn't explain. It only says, a little earlier, that he must be loosed for a little season."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "gog"),
    ("say", "voix", [
        ("« Et il sortira pour séduire les nations qui sont aux quatre coins de la terre, Gog et Magog, afin de les rassembler pour la guerre ; leur nombre est comme le sable de la mer. »",
         "\"And shall go out to deceive the nations which are in the four quarters of the earth, Gog and Magog, to gather them together to battle: the number of whom is as the sand of the sea.\""),
    ], "serious"),
    ("cue", "sable"),
    ("say", "claude", [
        ("Le sable de la mer : c'était l'image de la promesse faite à Abraham, une descendance innombrable. Ici, l'image est retournée : c'est le nombre des ennemis.",
         "The sand of the sea: it was the image of the promise made to Abraham, countless descendants. Here, the image is turned around: it is the number of the enemies."),
    ], "awe"),
    ("cue", "ezechiel"),
    ("say", "claude", [
        ("Gog et Magog : ces noms viennent du prophète Ézéchiel. Chez lui, Gog est un prince du pays de Magog, qui attaque Israël depuis le nord.",
         "Gog and Magog: these names come from the prophet Ezekiel. In his book, Gog is a prince of the land of Magog, who attacks Israel from the north."),
    ], "neutral"),
    ("cue", "partout"),
    ("say", "claude", [
        ("Ici, ils deviennent le nom de tous les peuples révoltés, aux quatre coins du monde.",
         "Here, they become the name of all the rebellious peoples, in the four corners of the world."),
    ], "neutral"),
    ("cue", "legende"),
    ("say", "claude", [
        ("Ces deux noms ont fasciné. Au Moyen Âge, on racontait qu'Alexandre le Grand les avait enfermés derrière un mur de fer. Et à Londres, deux géants nommés Gog et Magog gardent encore l'hôtel de ville.",
         "These two names have fascinated people. In the Middle Ages, it was said that Alexander the Great had shut them behind an iron wall. And in London, two giants named Gog and Magog still guard the Guildhall."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "camp"),
    ("say", "voix", [
        ("« Et ils montèrent sur la surface de la terre, et ils investirent le camp des saints et la ville bien-aimée. Mais un feu descendit du ciel, et les dévora. »",
         "\"And they went up on the breadth of the earth, and compassed the camp of the saints about, and the beloved city: and fire came down from God out of heaven, and devoured them.\""),
    ], "serious"),
    ("cue", "campsaints"),
    ("say", "claude", [
        ("Le camp des saints, comme le camp des Hébreux dans le désert, rassemblé autour du tabernacle. Et la ville bien-aimée : Jérusalem.",
         "The camp of the saints, like the camp of the Hebrews in the desert, gathered around the tabernacle. And the beloved city: Jerusalem."),
    ], "neutral"),
    ("cue", "phrase"),
    ("say", "claude", [
        ("Remarquez : il n'y a pas de bataille. Une armée immense encercle la ville… et tout se termine en une phrase. Personne n'a besoin de combattre.",
         "Notice: there is no battle. An immense army surrounds the city… and it all ends in one sentence. No one needs to fight."),
    ], "awe"),
    ("cue", "elie"),
    ("say", "claude", [
        ("Ce feu du ciel rappelle d'autres scènes : celui qui tombe sur Sodome, ou celui que le prophète Élie fait descendre sur les soldats envoyés contre lui.",
         "This fire from heaven recalls other scenes: the one that falls on Sodom, or the one the prophet Elijah calls down on the soldiers sent against him."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "diable"),
    ("say", "voix", [
        ("« Et le diable, qui les séduisait, fut jeté dans l'étang de feu et de soufre, où sont la bête et le faux prophète. Et ils seront tourmentés jour et nuit, aux siècles des siècles. »",
         "\"And the devil that deceived them was cast into the lake of fire and brimstone, where the beast and the false prophet are, and shall be tormented day and night for ever and ever.\""),
    ], "serious"),
    ("cue", "seducteur"),
    ("say", "claude", [
        ("Un détail revient sans cesse : il séduit. Dès la Genèse, le serpent trompait Ève. Ici, le grand séducteur est mis hors d'état de nuire, pour toujours.",
         "One detail keeps coming back: he deceives. From Genesis on, the serpent deceived Eve. Here, the great deceiver is put out of action, for ever."),
    ], "neutral"),
    ("cue", "bete"),
    ("say", "claude", [
        ("Et il rejoint deux personnages déjà jetés là : la bête et le faux prophète. Nous les croiserons en remontant le livre.",
         "And he joins two figures already thrown there: the beast and the false prophet. We'll meet them as we go back through the book."),
    ], "neutral"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, un ange descend du ciel avec la clé de l'abîme et une grande chaîne. Il saisit le dragon, l'enferme pour mille ans… et des trônes apparaissent. Ce sera le prochain épisode.",
         "But this story follows another one. Just before, an angel comes down from heaven with the key of the abyss and a great chain. He seizes the dragon, shuts him away for a thousand years… and thrones appear. That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
