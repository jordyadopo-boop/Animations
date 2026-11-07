# Episode 60 - Sept coupes d'or (Apocalypse 15, 5-8) - on remonte la Bible scene par scene
# Format dialogue : Mr A et Claude racontent l'histoire ensemble
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "mra": dict(voice="fr-CH-FabriceNeural", rate="+4%", pitch="+0Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "mra", [
        ("Claude, la dernière fois, une voix disait aux anges : versez les sept coupes. Mais ces coupes, d'où elles viennent ?",
         "Claude, last time, a voice told the angels: pour out the seven bowls. But those bowls, where do they come from?"),
    ], "neutral"),
    ("cue", "serie"),
    ("say", "claude", [
        ("Bonne question, Mister A. On remonte la Bible, scène par scène. Juste avant, les anges les reçoivent. Des coupes en or.",
         "Good question, Mr A. We're going back through the Bible, scene by scene. Just before, the angels receive them. Golden bowls."),
    ], "happy"),
    ("cue", "title"),
    ("title", "SEPT COUPES\\ND'OR", "Seven golden bowls", 2.8),
    ("pause", 2.6),

    ("scene", "temple"),
    ("say", "voix", [
        ("« Après cela, je regardai, et le temple du tabernacle du témoignage fut ouvert dans le ciel. »",
         "\"And after that I looked, and, behold, the temple of the tabernacle of the testimony in heaven was opened.\""),
    ], "serious"),
    ("cue", "tabernacle"),
    ("say", "mra", [
        ("Le tabernacle du témoignage… c'est quoi, exactement ?",
         "The tabernacle of the testimony… what is it, exactly?"),
    ], "neutral"),
    ("cue", "tente"),
    ("say", "claude", [
        ("Au temps de Moïse, dans le désert, c'était une grande tente sacrée. Au fond, il y avait l'arche, avec les tables de la loi : on les appelait le témoignage.",
         "In Moses' time, in the desert, it was a great sacred tent. At the back stood the ark, with the tablets of the law: they were called the testimony."),
    ], "neutral"),
    ("cue", "modele"),
    ("say", "claude", [
        ("Et Dieu avait dit à Moïse de la construire d'après le modèle qu'il lui avait montré sur la montagne. Ici, Jean voit l'original, dans le ciel.",
         "And God had told Moses to build it after the pattern shown to him on the mountain. Here, John sees the original, in heaven."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "anges"),
    ("say", "voix", [
        ("« Et les sept anges qui tenaient les sept fléaux sortirent du temple, revêtus d'un lin pur, éclatant, et ayant des ceintures d'or autour de la poitrine. »",
         "\"And the seven angels came out of the temple, having the seven plagues, clothed in pure and white linen, and having their breasts girded with golden girdles.\""),
    ], "serious"),
    ("cue", "pretres"),
    ("say", "mra", [
        ("Du lin blanc, des ceintures d'or… on dirait des prêtres.",
         "White linen, golden belts… they look like priests."),
    ], "awe"),
    ("cue", "lin"),
    ("say", "claude", [
        ("Exactement. Dans la loi de Moïse, le grand prêtre s'habille de lin pour entrer dans le lieu très saint. Et au tout début de l'Apocalypse, Jésus lui-même apparaît avec une ceinture d'or sur la poitrine.",
         "Exactly. In the law of Moses, the high priest dresses in linen to enter the most holy place. And at the very start of Revelation, Jesus himself appears with a golden belt across his chest."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "coupes"),
    ("say", "voix", [
        ("« Et l'un des quatre êtres vivants donna aux sept anges sept coupes d'or, pleines de la colère du Dieu qui vit aux siècles des siècles. »",
         "\"And one of the four beasts gave unto the seven angels seven golden vials full of the wrath of God, who liveth for ever and ever.\""),
    ], "serious"),
    ("cue", "etres"),
    ("say", "mra", [
        ("Les quatre êtres vivants, on les a déjà croisés, non ?",
         "The four living creatures, we've already met them, haven't we?"),
    ], "neutral"),
    ("cue", "lion"),
    ("say", "claude", [
        ("Oui, autour du trône de Dieu : le premier ressemble à un lion, le deuxième à un veau, le troisième a un visage d'homme, et le quatrième ressemble à un aigle qui vole.",
         "Yes, around the throne of God: the first is like a lion, the second like a calf, the third has a man's face, and the fourth is like a flying eagle."),
    ], "neutral"),
    ("cue", "prieres"),
    ("say", "claude", [
        ("Et ces coupes d'or, on les a vues aussi. Au chapitre cinq, elles étaient remplies de parfums : les prières des saints.",
         "And these golden bowls, we've seen them too. In chapter five, they were full of incense: the prayers of the saints."),
    ], "happy"),
    ("cue", "colere"),
    ("say", "mra", [
        ("Les mêmes coupes d'or… d'abord pleines de prières, maintenant pleines de colère.",
         "The same golden bowls… first full of prayers, now full of wrath."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "fumee"),
    ("say", "voix", [
        ("« Et le temple fut rempli de fumée, à cause de la gloire de Dieu et de sa puissance ; et personne ne pouvait entrer dans le temple, jusqu'à ce que les sept fléaux des sept anges fussent accomplis. »",
         "\"And the temple was filled with smoke from the glory of God, and from his power; and no man was able to enter into the temple, till the seven plagues of the seven angels were fulfilled.\""),
    ], "serious"),
    ("cue", "personne"),
    ("say", "mra", [
        ("Personne ne peut entrer… même pas les anges ?",
         "No one can go in… not even the angels?"),
    ], "awe"),
    ("cue", "moise"),
    ("say", "claude", [
        ("Personne. Et ce n'est pas la première fois. Quand Moïse termine le tabernacle, la nuée le remplit, et Moïse lui-même ne peut pas y entrer.",
         "No one. And it's not the first time. When Moses finishes the tabernacle, the cloud fills it, and Moses himself cannot enter."),
    ], "neutral"),
    ("cue", "salomon"),
    ("say", "claude", [
        ("Pareil à l'inauguration du temple de Salomon : la nuée remplit la maison, et les prêtres ne peuvent plus y faire leur service.",
         "The same at the dedication of Solomon's temple: the cloud fills the house, and the priests can no longer minister there."),
    ], "awe"),
    ("cue", "gloire"),
    ("say", "mra", [
        ("Donc la fumée, ce n'est pas un incendie. C'est la gloire de Dieu, tellement forte que personne ne peut s'approcher.",
         "So the smoke isn't a fire. It's the glory of God, so strong that no one can come near."),
    ], "awe"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre.",
         "But this story follows another one."),
    ], "neutral"),
    ("say", "mra", [
        ("Juste avant, Jean voit une mer de verre, mêlée de feu. Debout dessus, ceux qui ont vaincu la bête, avec des harpes de Dieu.",
         "Just before, John sees a sea of glass, mingled with fire. Standing on it, those who overcame the beast, with the harps of God."),
    ], "awe"),
    ("say", "claude", [
        ("Et ils chantent le cantique de Moïse et le cantique de l'Agneau. Ce sera le prochain épisode.",
         "And they sing the song of Moses and the song of the Lamb. That's the next episode."),
    ], "happy"),
    ("pause", 1.6),
]
