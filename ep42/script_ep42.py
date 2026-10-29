# Episode 42 - Une ville d'or descend du ciel (Apocalypse 21, 9-27) - on remonte la Bible scene par scene
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
    "ange": dict(voice="fr-CH-FabriceNeural", rate="-4%", pitch="-2Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Une ville en forme de cube, aussi haute que large : plus de deux mille kilomètres de chaque côté. Ses murs sont en pierres précieuses, et ses portes… sont des perles géantes.",
         "A city shaped like a cube, as tall as it is wide: over two thousand kilometres on each side. Its walls are made of precious stones, and its gates… are giant pearls."),
    ], "serious"),
    ("cue", "serie"),
    ("say", "claude", [
        ("On remonte la Bible, scène par scène. La dernière fois, l'arbre de vie réapparaissait. Juste avant, Jean découvre la ville où il pousse.",
         "We're going back through the Bible, scene by scene. Last time, the tree of life reappeared. Just before, John discovers the city where it grows."),
    ], "happy"),
    ("cue", "title"),
    ("title", "UNE VILLE D'OR\\NDESCEND DU CIEL", "A city of gold comes down from heaven", 2.8),
    ("pause", 2.6),

    ("scene", "montagne"),
    ("say", "claude", [
        ("Tout commence par un ange inattendu : l'un des sept anges qui ont versé sur la terre les sept derniers fléaux. Il dit à Jean :",
         "It all begins with an unexpected angel: one of the seven angels who poured the seven last plagues on the earth. He tells John:"),
    ], "neutral"),
    ("say", "ange", [
        ("« Viens, je te montrerai l'épouse, la femme de l'agneau. »",
         "\"Come hither, I will shew thee the bride, the Lamb's wife.\""),
    ], "serious"),
    ("cue", "descend"),
    ("say", "claude", [
        ("Jean s'attend à voir une femme. Mais l'ange l'emmène sur une très haute montagne… et lui montre une ville.",
         "John expects to see a woman. But the angel takes him to a very high mountain… and shows him a city."),
    ], "awe"),
    ("say", "voix", [
        ("« Il me montra la ville sainte, Jérusalem, qui descendait du ciel d'auprès de Dieu, ayant la gloire de Dieu. »",
         "\"He shewed me that great city, the holy Jerusalem, descending out of heaven from God, having the glory of God.\""),
    ], "serious"),
    ("cue", "epouse"),
    ("say", "claude", [
        ("L'épouse, c'est donc la ville elle-même : le peuple de Dieu réuni.",
         "So the bride is the city itself: God's people gathered together."),
    ], "neutral"),
    ("cue", "babel"),
    ("say", "claude", [
        ("Et contrairement à la tour de Babel, elle ne monte pas de la terre : elle descend du ciel.",
         "And unlike the tower of Babel, it doesn't rise from the earth: it comes down from heaven."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "portes"),
    ("say", "voix", [
        ("« Elle avait douze portes, et sur ces portes douze anges, et des noms écrits, ceux des douze tribus des fils d'Israël. La muraille avait douze fondements, et sur eux les douze noms des douze apôtres de l'agneau. »",
         "\"And had twelve gates, and at the gates twelve angels, and names written thereon, which are the names of the twelve tribes of the children of Israel. And the wall of the city had twelve foundations, and in them the names of the twelve apostles of the Lamb.\""),
    ], "serious"),
    ("cue", "tribus"),
    ("say", "claude", [
        ("Trois portes de chaque côté : on peut entrer de toutes les directions.",
         "Three gates on each side: you can enter from every direction."),
    ], "awe"),
    ("cue", "haut"),
    ("say", "claude", [
        ("En haut, sur les portes, les douze tribus d'Israël : l'Ancien Testament.",
         "Up on the gates, the twelve tribes of Israel: the Old Testament."),
    ], "awe"),
    ("cue", "apotres"),
    ("say", "claude", [
        ("En bas, dans les fondations, les douze apôtres : le Nouveau. Les deux moitiés de la Bible, réunies dans les mêmes murs.",
         "Down in the foundations, the twelve apostles: the New. The two halves of the Bible, joined in the same walls."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "mesure"),
    ("say", "claude", [
        ("Puis l'ange sort un roseau d'or, une règle d'arpenteur, et il mesure la ville.",
         "Then the angel takes out a golden reed, a surveyor's rod, and he measures the city."),
    ], "neutral"),
    ("say", "voix", [
        ("« Il mesura la ville avec le roseau, et trouva douze mille stades ; la longueur, la largeur et la hauteur en étaient égales. »",
         "\"He measured the city with the reed, twelve thousand furlongs. The length and the breadth and the height of it are equal.\""),
    ], "serious"),
    ("cue", "stades"),
    ("say", "claude", [
        ("Douze mille stades, c'est environ deux mille deux cents kilomètres.",
         "Twelve thousand furlongs is about two thousand two hundred kilometres."),
    ], "awe"),
    ("cue", "athenes"),
    ("say", "claude", [
        ("De Paris jusqu'à Athènes… en long, en large, et en hauteur : un cube.",
         "From Paris to Athens… in length, in width, and in height: a cube."),
    ], "awe"),
    ("cue", "cube"),
    ("say", "claude", [
        ("Ce n'est pas un hasard. Dans le temple de Salomon, une seule pièce était un cube parfait : le lieu très saint, où reposait l'arche de l'alliance, et où seul le grand prêtre entrait, une fois par an. Ici, toute la ville est devenue ce lieu très saint.",
         "It's no accident. In Solomon's temple, only one room was a perfect cube: the Most Holy Place, where the Ark of the Covenant rested, and which only the high priest entered, once a year. Here, the whole city has become that Most Holy Place."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "pierres"),
    ("say", "voix", [
        ("« La muraille était construite en jaspe, et la ville était d'or pur, semblable à du verre pur. »",
         "\"And the building of the wall of it was of jasper: and the city was pure gold, like unto clear glass.\""),
    ], "serious"),
    ("cue", "liste"),
    ("say", "claude", [
        ("Les fondations sont ornées de douze pierres précieuses. Il y a du jaspe, du saphir, de l'émeraude, de la topaze, de l'améthyste…",
         "The foundations are adorned with twelve precious stones. There is jasper, sapphire, emerald, topaz, amethyst…"),
    ], "neutral"),
    ("cue", "pectoral"),
    ("say", "claude", [
        ("Douze pierres, comme celles que le grand prêtre portait sur sa poitrine, une pour chaque tribu.",
         "Twelve stones, like the ones the high priest wore on his chest, one for each tribe."),
    ], "neutral"),
    ("cue", "perles"),
    ("say", "voix", [
        ("« Les douze portes étaient douze perles ; chaque porte était d'une seule perle. La place de la ville était d'or pur, comme du verre transparent. »",
         "\"And the twelve gates were twelve pearls: every several gate was of one pearl: and the street of the city was pure gold, as it were transparent glass.\""),
    ], "happy"),
    ("cue", "perle"),
    ("say", "claude", [
        ("L'or, ce trésor pour lequel on se bat sur terre, sert ici… à paver la rue.",
         "Gold, the treasure people fight over on earth, is used here… to pave the street."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "temple"),
    ("say", "voix", [
        ("« Je ne vis point de temple dans la ville ; car le Seigneur Dieu tout-puissant est son temple, ainsi que l'agneau. »",
         "\"And I saw no temple therein: for the Lord God Almighty and the Lamb are the temple of it.\""),
    ], "serious"),
    ("cue", "sanstemple"),
    ("say", "claude", [
        ("Pour Jean, c'est un choc : le temple était le lieu où l'on venait rencontrer Dieu. Ici, il n'en faut plus : Dieu est présent partout.",
         "For John, it's a shock: the temple was the place where people came to meet God. Here, it's no longer needed: God is present everywhere."),
    ], "awe"),
    ("cue", "livre"),
    ("say", "voix", [
        ("« Ses portes ne se fermeront point le jour, car là il n'y aura point de nuit. Il n'entrera que ceux qui sont écrits dans le livre de vie de l'agneau. »",
         "\"And the gates of it shall not be shut at all by day: for there shall be no night there. None shall enter but they which are written in the Lamb's book of life.\""),
    ], "serious"),
    ("cue", "ouvertes"),
    ("say", "claude", [
        ("À l'époque, on fermait les portes des villes chaque nuit, par peur des ennemis. Celle-ci ne les ferme jamais : plus rien à craindre.",
         "Back then, city gates were shut every night, for fear of enemies. This one never shuts them: nothing left to fear."),
    ], "happy"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, Jean voit le ciel et la terre disparaître. Une voix annonce que Dieu essuiera toute larme… et, détail étrange, la mer n'existe plus. Ce sera le prochain épisode.",
         "But this story follows another one. Just before, John sees the heaven and the earth pass away. A voice announces that God will wipe away every tear… and, strangely, the sea is no more. That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
