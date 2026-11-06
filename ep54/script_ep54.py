# Episode 54 - Une ville immense fendue par un tremblement de terre (Apocalypse 16, 17-21) - on remonte la Bible scene par scene
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Le plus grand tremblement de terre de toute l'histoire humaine. Une ville immense se fend en trois morceaux. Et du ciel tombent des grêlons… de quarante kilos.",
         "The greatest earthquake in all of human history. A huge city splits into three pieces. And from the sky fall hailstones… of forty kilos."),
    ], "serious"),
    ("cue", "serie"),
    ("say", "claude", [
        ("On remonte la Bible, scène par scène. La dernière fois, Jean découvrait la femme au nom de Mystère. Juste avant, voici la toute dernière coupe.",
         "We're going back through the Bible, scene by scene. Last time, John discovered the woman named Mystery. Just before, here is the very last bowl."),
    ], "neutral"),
    ("cue", "title"),
    ("title", "UNE VILLE IMMENSE FENDUE\\NPAR UN TREMBLEMENT DE TERRE", "A huge city split by an earthquake", 2.8),
    ("pause", 2.6),

    ("scene", "coupe"),
    ("say", "voix", [
        ("« Le septième versa sa coupe dans l'air. Et il sortit du temple, du trône, une voix forte qui disait : C'en est fait ! »",
         "\"And the seventh angel poured out his vial into the air; and there came a great voice out of the temple of heaven, from the throne, saying, It is done.\""),
    ], "serious"),
    ("cue", "fait"),
    ("say", "claude", [
        ("« C'en est fait. » La septième coupe, c'est la dernière. Ce cri rappelle celui de Jésus sur la croix : « Tout est accompli. » Et on l'entendra encore une fois, à la toute fin du livre.",
         "\"It is done.\" The seventh bowl is the last one. This cry recalls Jesus on the cross: \"It is finished.\" And it will be heard once more, at the very end of the book."),
    ], "awe"),
    ("cue", "sept"),
    ("say", "claude", [
        ("Avant elle, six coupes ont déjà frappé : des plaies sur les hommes, la mer et les fleuves changés en sang, un soleil brûlant, les ténèbres, puis l'Euphrate asséché. La septième est versée dans l'air, partout à la fois.",
         "Before it, six bowls have already struck: sores on men, the sea and rivers turned to blood, a scorching sun, darkness, then the Euphrates dried up. The seventh is poured into the air, everywhere at once."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "seisme"),
    ("say", "voix", [
        ("« Et il y eut des éclairs, des voix, des tonnerres, et un grand tremblement de terre, tel qu'il n'y avait jamais eu depuis que l'homme est sur la terre. »",
         "\"And there were voices, and thunders, and lightnings; and there was a great earthquake, such as was not since men were upon the earth.\""),
    ], "serious"),
    ("cue", "asie"),
    ("say", "claude", [
        ("Pour les premiers lecteurs, c'était une peur bien réelle. Ils vivaient en Asie Mineure, l'actuelle Turquie. En l'an dix-sept, un séisme y avait détruit douze villes en une seule nuit, dont Sardes.",
         "For the first readers, it was a very real fear. They lived in Asia Minor, today's Turkey. In the year seventeen, an earthquake there destroyed twelve cities in a single night, including Sardis."),
    ], "neutral"),
    ("cue", "laodicee"),
    ("say", "claude", [
        ("Et en l'an soixante, c'est Laodicée qui s'effondre. Une ville si riche qu'elle s'est reconstruite seule, sans l'aide de Rome. Laodicée, l'une des sept Églises à qui l'Apocalypse est adressée.",
         "And in the year sixty, it was Laodicea that collapsed. A city so rich that it rebuilt itself on its own, without Rome's help. Laodicea, one of the seven churches Revelation is addressed to."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "ville"),
    ("say", "voix", [
        ("« Et la grande ville fut divisée en trois parties, et les villes des nations tombèrent, et Dieu se souvint de Babylone la grande, pour lui donner la coupe du vin de son ardente colère. Et toutes les îles s'enfuirent, et les montagnes ne furent pas retrouvées. »",
         "\"And the great city was divided into three parts, and the cities of the nations fell: and great Babylon came in remembrance before God, to give unto her the cup of the wine of the fierceness of his wrath. And every island fled away, and the mountains were not found.\""),
    ], "serious"),
    ("cue", "coupes"),
    ("say", "claude", [
        ("Remarquez le jeu de miroir : Babylone faisait boire au monde sa coupe d'or. Maintenant, c'est elle qui reçoit une coupe à boire.",
         "Notice the mirror: Babylon made the world drink from her golden cup. Now it's she who is given a cup to drink."),
    ], "awe"),
    ("cue", "patmos"),
    ("say", "claude", [
        ("Et les îles s'enfuient… Pour Jean, qui écrit exilé sur la petite île de Patmos, l'image devait être saisissante.",
         "And the islands flee away… For John, writing in exile on the small island of Patmos, the image must have been striking."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "grele"),
    ("say", "voix", [
        ("« Et une grosse grêle, dont les grêlons pesaient un talent, tomba du ciel sur les hommes ; et les hommes blasphémèrent Dieu, à cause du fléau de la grêle. »",
         "\"And there fell upon men a great hail out of heaven, every stone about the weight of a talent: and men blasphemed God because of the plague of the hail.\""),
    ], "serious"),
    ("cue", "talent"),
    ("say", "claude", [
        ("Un talent, c'était une unité de poids : entre vingt-cinq et quarante kilos. Pour comparer, le plus gros grêlon jamais mesuré pesait à peine un kilo.",
         "A talent was a unit of weight: between twenty-five and forty kilos. For comparison, the biggest hailstone ever measured weighed barely one kilo."),
    ], "neutral"),
    ("cue", "egypte"),
    ("say", "claude", [
        ("Et ce n'est pas la première fois. Dans l'Exode, la septième plaie d'Égypte, c'était déjà la grêle. Et comme le pharaon autrefois, ici, les hommes ne changent pas : ils maudissent Dieu.",
         "And it's not the first time. In Exodus, the seventh plague of Egypt was already hail. And like Pharaoh long ago, here, people don't change: they curse God."),
    ], "awe"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, le grand fleuve Euphrate se met à sécher. Trois esprits impurs, semblables à des grenouilles, rassemblent les rois du monde en un lieu appelé Harmaguédon. Ce sera le prochain épisode.",
         "But this story follows another one. Just before, the great river Euphrates dries up. Three unclean spirits, like frogs, gather the kings of the world to a place called Armageddon. That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
