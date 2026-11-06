# Episode 55 - Trois esprits verts sortent de la gueule du dragon (Apocalypse 16, 12-16) - on remonte la Bible scene par scene
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Un fleuve immense qui s'assèche. Trois esprits verts, comme des grenouilles, qui sortent de trois bouches. Et tous les rois du monde convoqués en un seul lieu : Harmaguédon.",
         "A huge river drying up. Three green spirits, like frogs, coming out of three mouths. And all the kings of the world summoned to a single place: Armageddon."),
    ], "serious"),
    ("cue", "serie"),
    ("say", "claude", [
        ("On remonte la Bible, scène par scène. La dernière fois, une ville immense se fendait en trois. Juste avant, voici la sixième coupe.",
         "We're going back through the Bible, scene by scene. Last time, a huge city split into three. Just before, here is the sixth bowl."),
    ], "neutral"),
    ("cue", "title"),
    ("title", "TROIS ESPRITS VERTS SORTENT\\NDE LA GUEULE DU DRAGON", "Three green spirits come out of the dragon's mouth", 2.8),
    ("pause", 2.6),

    ("scene", "fleuve"),
    ("say", "voix", [
        ("« Le sixième versa sa coupe sur le grand fleuve, l'Euphrate. Et son eau tarit, afin que le chemin des rois venant de l'Orient fût préparé. »",
         "\"And the sixth angel poured out his vial upon the great river Euphrates; and the water thereof was dried up, that the way of the kings of the east might be prepared.\""),
    ], "serious"),
    ("cue", "parthes"),
    ("say", "claude", [
        ("L'Euphrate, c'était la frontière de l'Empire romain. Et de l'autre côté vivaient les Parthes, les cavaliers les plus redoutés de l'époque. Un Euphrate à sec, c'était la porte ouverte à l'invasion.",
         "The Euphrates was the border of the Roman Empire. And on the other side lived the Parthians, the most feared horsemen of the time. A dry Euphrates meant the door was open to invasion."),
    ], "neutral"),
    ("cue", "cyrus"),
    ("say", "claude", [
        ("Et souvenez-vous : c'est en détournant l'Euphrate que le roi Cyrus avait pris Babylone. On en parlait dans l'épisode cinquante et un.",
         "And remember: it was by diverting the Euphrates that King Cyrus took Babylon. We talked about it in episode fifty-one."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "grenouilles"),
    ("say", "voix", [
        ("« Et je vis sortir de la bouche du dragon, et de la bouche de la bête, et de la bouche du faux prophète, trois esprits impurs, semblables à des grenouilles. Car ce sont des esprits de démons, qui font des prodiges, et qui vont vers les rois de toute la terre, afin de les rassembler pour le combat du grand jour du Dieu tout-puissant. »",
         "\"And I saw three unclean spirits like frogs come out of the mouth of the dragon, and out of the mouth of the beast, and out of the mouth of the false prophet. For they are the spirits of devils, working miracles, which go forth unto the kings of the earth and of the whole world, to gather them to the battle of that great day of God Almighty.\""),
    ], "serious"),
    ("cue", "egypte"),
    ("say", "claude", [
        ("Des grenouilles, encore un écho de l'Égypte : c'était la deuxième plaie, quand elles avaient envahi tout le pays, jusque dans le palais du pharaon. Ici, elles sortent de la bouche : ce sont des paroles trompeuses, des discours qui entraînent les rois vers la guerre.",
         "Frogs, another echo of Egypt: they were the second plague, when they invaded the whole land, right into Pharaoh's palace. Here, they come out of the mouth: they are deceitful words, speeches that drag the kings into war."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "voleur"),
    ("say", "voix", [
        ("« Voici, je viens comme un voleur. Heureux celui qui veille, et qui garde ses vêtements, afin qu'il ne marche pas nu et qu'on ne voie pas sa honte ! »",
         "\"Behold, I come as a thief. Blessed is he that watcheth, and keepeth his garments, lest he walk naked, and they see his shame.\""),
    ], "serious"),
    ("cue", "sardes"),
    ("say", "claude", [
        ("Au milieu de la scène, une voix coupe le récit : celle du Christ. Comme un voleur, c'est l'image que Jésus utilisait dans les Évangiles. Et les habitants de Sardes la comprenaient bien : leur citadelle, réputée imprenable, avait été prise deux fois par surprise… parce que personne ne veillait.",
         "In the middle of the scene, a voice interrupts the story: Christ's. Like a thief: that's the image Jesus used in the Gospels. And the people of Sardis understood it well: their citadel, said to be impregnable, had been taken twice by surprise… because no one was keeping watch."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "harmaguedon"),
    ("say", "voix", [
        ("« Ils les rassemblèrent dans le lieu appelé en hébreu Harmaguédon. »",
         "\"And he gathered them together into a place called in the Hebrew tongue Armageddon.\""),
    ], "serious"),
    ("cue", "meguiddo"),
    ("say", "claude", [
        ("Harmaguédon, c'est « Har Meguiddo » : la montagne de Meguiddo, une colline qui existe vraiment, dans le nord d'Israël. Elle garde un passage stratégique, et on s'y bat depuis toujours.",
         "Armageddon is \"Har Megiddo\": the mountain of Megiddo, a hill that really exists, in northern Israel. It guards a strategic pass, and people have fought there since forever."),
    ], "neutral"),
    ("cue", "batailles"),
    ("say", "claude", [
        ("Le pharaon Thoutmôsis trois y a livré l'une des plus anciennes batailles racontées de l'histoire. Le roi Josias y est mort. Et en mille neuf cent dix-huit, un général britannique y a encore combattu. Aujourd'hui, le mot Armageddon veut dire : la bataille de la fin du monde.",
         "Pharaoh Thutmose the Third fought there one of the oldest recorded battles in history. King Josiah died there. And in 1918, a British general fought there yet again. Today, the word Armageddon means the battle at the end of the world."),
    ], "awe"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, le cinquième ange verse sa coupe sur le trône de la bête. Son royaume est plongé dans les ténèbres, et les hommes se mordent la langue de douleur. Ce sera le prochain épisode.",
         "But this story follows another one. Just before, the fifth angel pours out his bowl upon the throne of the beast. His kingdom is plunged into darkness, and men gnaw their tongues in pain. That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
