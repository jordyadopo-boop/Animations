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
        ("On remonte la Bible, scène par scène. La dernière fois, l'arbre de vie réapparaissait au bord d'un fleuve de cristal. Juste avant, Jean découvre la ville où pousse cet arbre.",
         "We're going back through the Bible, scene by scene. Last time, the tree of life reappeared by a crystal river. Just before, John discovers the city where that tree grows."),
    ], "happy"),
    ("cue", "title"),
    ("title", "UNE VILLE D'OR\\NDESCEND DU CIEL", "A city of gold comes down from heaven", 2.8),
    ("pause", 2.6),

    ("scene", "montagne"),
    ("say", "claude", [
        ("Tout commence par un ange inattendu. C'est l'un des sept anges qui ont versé sur la terre les sept derniers fléaux. Celui qui apportait la catastrophe vient maintenant montrer autre chose. Il dit à Jean :",
         "It all begins with an unexpected angel. He is one of the seven angels who poured the seven last plagues on the earth. The one who brought disaster now comes to show something else. He tells John:"),
    ], "neutral"),
    ("say", "ange", [
        ("« Viens, je te montrerai l'épouse, la femme de l'agneau. »",
         "\"Come hither, I will shew thee the bride, the Lamb's wife.\""),
    ], "serious"),
    ("cue", "descend"),
    ("say", "claude", [
        ("Jean s'attend à voir une femme. Mais l'ange le transporte sur une très haute montagne… et lui montre une ville. Il raconte :",
         "John expects to see a woman. But the angel carries him to a very high mountain… and shows him a city. He says:"),
    ], "awe"),
    ("say", "voix", [
        ("« Il me montra la ville sainte, Jérusalem, qui descendait du ciel d'auprès de Dieu, ayant la gloire de Dieu. Son éclat était semblable à celui d'une pierre de jaspe transparente comme du cristal. »",
         "\"He shewed me that great city, the holy Jerusalem, descending out of heaven from God, having the glory of God: and her light was like unto a jasper stone, clear as crystal.\""),
    ], "serious"),
    ("cue", "epouse"),
    ("say", "claude", [
        ("L'épouse, c'est donc la ville elle-même : l'image de tous ceux qui appartiennent à Dieu, réunis. Et elle ne monte pas de la terre, comme la tour de Babel : elle descend du ciel.",
         "So the bride is the city itself: the image of all those who belong to God, gathered together. And it doesn't rise from the earth, like the tower of Babel: it comes down from heaven."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "portes"),
    ("say", "voix", [
        ("« Elle avait une grande et haute muraille. Elle avait douze portes, et sur ces portes douze anges, et des noms écrits, ceux des douze tribus des fils d'Israël. La muraille avait douze fondements, et sur eux les douze noms des douze apôtres de l'agneau. »",
         "\"And had a wall great and high, and had twelve gates, and at the gates twelve angels, and names written thereon, which are the names of the twelve tribes of the children of Israel. And the wall of the city had twelve foundations, and in them the names of the twelve apostles of the Lamb.\""),
    ], "serious"),
    ("cue", "tribus"),
    ("say", "claude", [
        ("Trois portes à l'est, trois au nord, trois au sud, trois à l'ouest : on peut entrer de toutes les directions. Et regardez les noms : en haut, sur les portes, les douze tribus d'Israël, l'Ancien Testament. En bas, dans les fondations, les douze apôtres de Jésus, le Nouveau. Les deux moitiés de la Bible sont réunies dans les mêmes murs.",
         "Three gates to the east, three to the north, three to the south, three to the west: you can enter from every direction. And look at the names: up on the gates, the twelve tribes of Israel, the Old Testament. Down in the foundations, the twelve apostles of Jesus, the New. The two halves of the Bible are joined in the same walls."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "mesure"),
    ("say", "claude", [
        ("Puis l'ange sort un roseau d'or, une règle d'arpenteur, et il mesure la ville.",
         "Then the angel takes out a golden reed, a surveyor's rod, and he measures the city."),
    ], "neutral"),
    ("say", "voix", [
        ("« La ville avait la forme d'un carré. Il mesura la ville avec le roseau, et trouva douze mille stades ; la longueur, la largeur et la hauteur en étaient égales. »",
         "\"And the city lieth foursquare. And he measured the city with the reed, twelve thousand furlongs. The length and the breadth and the height of it are equal.\""),
    ], "serious"),
    ("cue", "stades"),
    ("say", "claude", [
        ("Douze mille stades, c'est environ deux mille deux cents kilomètres. Posée sur la carte, cette ville irait de Paris jusqu'à Athènes… et elle serait aussi haute que large : un cube.",
         "Twelve thousand furlongs is about two thousand two hundred kilometres. Laid on a map, this city would stretch from Paris to Athens… and it would be as tall as it is wide: a cube."),
    ], "awe"),
    ("cue", "cube"),
    ("say", "claude", [
        ("Et ce n'est pas un hasard. Dans le temple du roi Salomon, une seule pièce avait cette forme parfaite : le lieu très saint, où reposait l'arche de l'alliance, et où seul le grand prêtre entrait, une fois par an. Ici, toute la ville est devenue ce lieu très saint.",
         "And it's no accident. In King Solomon's temple, only one room had this perfect shape: the Most Holy Place, where the Ark of the Covenant rested, and which only the high priest entered, once a year. Here, the whole city has become that Most Holy Place."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "pierres"),
    ("say", "voix", [
        ("« La muraille était construite en jaspe, et la ville était d'or pur, semblable à du verre pur. Les fondements de la muraille étaient ornés de pierres précieuses de toute espèce. »",
         "\"And the building of the wall of it was of jasper: and the city was pure gold, like unto clear glass. And the foundations of the wall of the city were garnished with all manner of precious stones.\""),
    ], "serious"),
    ("cue", "liste"),
    ("say", "claude", [
        ("Le texte les nomme une par une : du jaspe, du saphir, de l'émeraude, de la topaze, de l'améthyste, et sept autres encore. Douze pierres, qui rappellent les douze pierres que le grand prêtre portait sur sa poitrine, une pour chaque tribu.",
         "The text names them one by one: jasper, sapphire, emerald, topaz, amethyst, and seven more. Twelve stones, recalling the twelve stones the high priest wore on his chest, one for each tribe."),
    ], "neutral"),
    ("say", "voix", [
        ("« Les douze portes étaient douze perles ; chaque porte était d'une seule perle. La place de la ville était d'or pur, comme du verre transparent. »",
         "\"And the twelve gates were twelve pearls: every several gate was of one pearl: and the street of the city was pure gold, as it were transparent glass.\""),
    ], "happy"),
    ("cue", "perle"),
    ("say", "claude", [
        ("Chaque porte taillée dans une seule perle ! Et de l'or si pur qu'il devient transparent. L'or, le trésor pour lequel on se bat sur terre, sert ici… à paver la rue.",
         "Each gate carved from a single pearl! And gold so pure it becomes transparent. Gold, the treasure people fight over on earth, is used here… to pave the street."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "temple"),
    ("say", "voix", [
        ("« Je ne vis point de temple dans la ville ; car le Seigneur Dieu tout-puissant est son temple, ainsi que l'agneau. La ville n'a besoin ni du soleil ni de la lune pour l'éclairer ; car la gloire de Dieu l'éclaire. »",
         "\"And I saw no temple therein: for the Lord God Almighty and the Lamb are the temple of it. And the city had no need of the sun, neither of the moon, to shine in it: for the glory of God did lighten it.\""),
    ], "serious"),
    ("cue", "sanstemple"),
    ("say", "claude", [
        ("Pour Jean, c'est un choc. Jérusalem sans temple, c'est impensable : le temple était le seul endroit où l'on venait rencontrer Dieu. Ici, il n'en faut plus. Dieu est présent partout.",
         "For John, it's a shock. Jerusalem without a temple is unthinkable: the temple was the only place where people came to meet God. Here, it's no longer needed. God is present everywhere."),
    ], "awe"),
    ("say", "voix", [
        ("« Ses portes ne se fermeront point le jour, car là il n'y aura point de nuit. Il n'entrera chez elle rien de souillé, mais ceux-là seuls qui sont écrits dans le livre de vie de l'agneau. »",
         "\"And the gates of it shall not be shut at all by day: for there shall be no night there. And there shall in no wise enter into it any thing that defileth: but they which are written in the Lamb's book of life.\""),
    ], "serious"),
    ("cue", "ouvertes"),
    ("say", "claude", [
        ("À l'époque, chaque ville fermait ses portes à la tombée de la nuit, par peur des ennemis. Celle-ci ne les ferme jamais. Il n'y a plus rien à craindre.",
         "At the time, every city shut its gates at nightfall, for fear of enemies. This one never shuts them. There is nothing left to fear."),
    ], "happy"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, Jean voit le ciel et la terre disparaître. Une voix annonce que Dieu va essuyer toute larme… et le texte ajoute un détail étrange : la mer n'existe plus. Ce sera le prochain épisode.",
         "But this story follows another one. Just before, John sees the heaven and the earth pass away. A voice announces that God will wipe away every tear… and the text adds a strange detail: the sea is no more. That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
