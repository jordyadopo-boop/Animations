# Episode 30 - Ou est passee l'Arche d'alliance ? (selon les textes bibliques et les traditions)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "bezalel": dict(voice="fr-CA-AntoineNeural", rate="+0%", pitch="-2Hz"),
    "moine": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-6Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.4),
    ("say", "claude", [
        ("Un coffre couvert d'or, gardé par deux chérubins. Selon la Bible, il était si sacré que ceux qui le portaient ne devaient pas le toucher. Et puis un jour… il a disparu.",
         "A chest covered in gold, guarded by two cherubim. According to the Bible, it was so sacred that those who carried it were not to touch it. And then one day… it vanished."),
    ], "serious"),
    ("cue", "title"),
    ("title", "OÙ EST PASSÉE L'ARCHE D'ALLIANCE ?", "Where did the Ark of the Covenant go?", 2.8),
    ("pause", 2.7),

    ("scene", "atelier"),
    ("date", "Selon l'Exode · au pied du Sinaï", "According to Exodus · at the foot of Sinai", 2.6),
    ("pause", 0.4),
    ("say", "claude", [
        ("Selon le livre de l'Exode, Dieu donne à Moïse des instructions très précises : un coffre en bois d'acacia, d'un peu plus d'un mètre de long, recouvert d'or pur, dedans et dehors.",
         "According to the Book of Exodus, God gives Moses very precise instructions: a chest of acacia wood, a little over a metre long, overlaid with pure gold, inside and out."),
    ], "neutral"),
    ("cue", "bezalel_dit"),
    ("say", "bezalel", [("Deux coudées et demie de long, une coudée et demie de large. Pas un doigt de plus.", "Two and a half cubits long, a cubit and a half wide. Not a finger more.")], "serious"),
    ("cue", "cherubins"),
    ("say", "claude", [
        ("Sur le couvercle, deux chérubins en or, ailes déployées, se font face. À l'intérieur, selon les textes : les deux tables de pierre de la Loi.",
         "On the lid, two golden cherubim face each other, wings spread. Inside, according to the texts: the two stone tablets of the Law."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "jourdain"),
    ("say", "claude", [
        ("Portée sur des barres par les prêtres, l'arche accompagne le peuple. Selon le livre de Josué, quand ils entrent dans le Jourdain, les eaux s'arrêtent.",
         "Carried on poles by the priests, the ark goes with the people. According to the Book of Joshua, when they step into the Jordan, the waters stop."),
    ], "awe"),
    ("cue", "jericho"),
    ("say", "claude", [
        ("Puis on la porte pendant sept jours autour des murailles de Jéricho.",
         "Then it is carried for seven days around the walls of Jericho."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "dagon"),
    ("say", "claude", [
        ("Elle est même capturée par les Philistins, qui la placent dans le temple de leur dieu Dagon. Selon le premier livre de Samuel, au matin, la statue est retrouvée face contre terre.",
         "It is even captured by the Philistines, who place it in the temple of their god Dagon. According to the First Book of Samuel, in the morning, the statue is found face down on the ground."),
    ], "serious"),
    ("cue", "vaches"),
    ("say", "claude", [
        ("Ils finissent par la renvoyer, sur un chariot tiré par deux vaches.",
         "They end up sending it back, on a cart pulled by two cows."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "temple"),
    ("say", "claude", [
        ("Le roi David la fait monter à Jérusalem en dansant devant elle. Puis son fils Salomon la place au cœur du Temple, dans le Saint des Saints.",
         "King David brings it up to Jerusalem, dancing before it. Then his son Solomon places it at the heart of the Temple, in the Holy of Holies."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "babylone"),
    ("date", "587 av. J.-C. · Jérusalem", "587 BC · Jerusalem", 2.4),
    ("pause", 0.3),
    ("say", "claude", [
        ("En 587 avant notre ère, les Babyloniens détruisent le Temple. La Bible énumère les objets emportés… mais l'arche n'est plus jamais nommée. Elle disparaît de l'histoire.",
         "In 587 BC, the Babylonians destroy the Temple. The Bible lists the objects carried away… but the ark is never named again. It vanishes from history."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "pistes"),
    ("say", "claude", [
        ("Alors, où est-elle ? Le deuxième livre des Maccabées raconte que le prophète Jérémie l'aurait cachée dans une grotte, sur le mont Nebo.",
         "So where is it? The Second Book of Maccabees says the prophet Jeremiah hid it in a cave on Mount Nebo."),
    ], "neutral"),
    ("cue", "aksoum"),
    ("say", "claude", [
        ("Et en Éthiopie, l'Église orthodoxe affirme qu'elle est gardée à Aksoum, dans une chapelle. Un seul moine a le droit de la voir.",
         "And in Ethiopia, the Orthodox Church says it is kept in Aksum, in a chapel. Only one monk is allowed to see it."),
    ], "neutral"),
    ("cue", "moine_dit"),
    ("say", "moine", [("Je la garde jusqu'à ma mort. Personne d'autre n'entre ici.", "I guard it until my death. No one else enters here.")], "serious"),
    ("cue", "verif"),
    ("say", "claude", [
        ("Aucune de ces pistes n'a pu être vérifiée par les archéologues.",
         "None of these leads could be verified by archaeologists."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("Et toi, tu penses qu'elle existe encore, cachée quelque part ? Dis-le-moi en commentaire.",
         "And you, do you think it still exists, hidden somewhere? Tell me in the comments."),
    ], "happy"),
    ("pause", 1.6),
]
