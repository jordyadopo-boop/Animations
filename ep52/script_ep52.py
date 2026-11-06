# Episode 52 - Dix rois se retournent contre elle (Apocalypse 17, 7-18) - on remonte la Bible scene par scene
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Une reine assise sur une bête à sept têtes. Dix rois la servent… et un jour, ces mêmes rois vont la détruire. Pourquoi ?",
         "A queen sitting on a seven-headed beast. Ten kings serve her… and one day, those very kings will destroy her. Why?"),
    ], "serious"),
    ("cue", "serie"),
    ("say", "claude", [
        ("On remonte la Bible, scène par scène. La dernière fois, un ange criait : « Elle est tombée, Babylone ! » Juste avant, un autre ange explique à Jean tout le mystère.",
         "We're going back through the Bible, scene by scene. Last time, an angel cried: \"Babylon is fallen!\" Just before, another angel explains the whole mystery to John."),
    ], "neutral"),
    ("cue", "title"),
    ("title", "DIX ROIS SE RETOURNENT\\NCONTRE ELLE", "Ten kings turn against her", 2.8),
    ("pause", 2.6),

    ("scene", "mystere"),
    ("say", "voix", [
        ("« Et l'ange me dit : Pourquoi t'étonnes-tu ? Je te dirai le mystère de la femme et de la bête qui la porte. La bête que tu as vue était, et elle n'est plus. Elle doit monter de l'abîme, et aller à la perdition. »",
         "\"And the angel said unto me, Wherefore didst thou marvel? I will tell thee the mystery of the woman, and of the beast that carrieth her. The beast that thou sawest was, and is not; and shall ascend out of the bottomless pit, and go into perdition.\""),
    ], "serious"),
    ("cue", "parodie"),
    ("say", "claude", [
        ("Écoutez bien cette formule : elle était, elle n'est plus, et elle reparaîtra. Au début de l'Apocalypse, Dieu est « celui qui est, qui était, et qui vient ». La bête en est une copie… une imitation de Dieu.",
         "Listen closely to that phrase: it was, it is not, and it will come again. At the start of Revelation, God is \"he which is, and which was, and which is to come\". The beast is a copy of it… an imitation of God."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "tetes"),
    ("say", "voix", [
        ("« Les sept têtes sont sept montagnes, sur lesquelles la femme est assise. Ce sont aussi sept rois : cinq sont tombés, un existe, l'autre n'est pas encore venu. »",
         "\"The seven heads are seven mountains, on which the woman sitteth. And there are seven kings: five are fallen, and one is, and the other is not yet come.\""),
    ], "serious"),
    ("cue", "empereurs"),
    ("say", "claude", [
        ("Sept montagnes, encore Rome et ses sept collines. Et ces rois, beaucoup d'historiens y voient les empereurs romains : cinq déjà morts, un qui règne au moment où Jean écrit, et un autre à venir.",
         "Seven mountains: Rome and its seven hills again. And for those kings, many historians see the Roman emperors: five already dead, one reigning as John writes, and another yet to come."),
    ], "neutral"),
    ("cue", "neron"),
    ("say", "claude", [
        ("Et une rumeur courait à l'époque : l'empereur Néron, mort en soixante-huit, n'était pas vraiment mort, et il allait revenir. Une bête qui était, qui n'est plus… et qui reparaîtra.",
         "And a rumour was going around at the time: the emperor Nero, who died in sixty-eight, wasn't really dead, and he would come back. A beast that was, is not… and will appear again."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "cornes"),
    ("say", "voix", [
        ("« Les dix cornes que tu as vues sont dix rois, qui reçoivent autorité comme rois pendant une heure avec la bête. Ils combattront contre l'agneau, et l'agneau les vaincra, parce qu'il est le Seigneur des seigneurs et le Roi des rois. »",
         "\"And the ten horns which thou sawest are ten kings, which receive power as kings one hour with the beast. These shall make war with the Lamb, and the Lamb shall overcome them: for he is Lord of lords, and King of kings.\""),
    ], "serious"),
    ("cue", "daniel"),
    ("say", "claude", [
        ("Dix cornes, c'est l'image du prophète Daniel, qui voyait une bête terrible avec dix cornes. Et ces rois ne régneront qu'une heure. Roi des rois : c'est le nom écrit sur le cavalier blanc, dans l'épisode quarante-sept.",
         "Ten horns is the image of the prophet Daniel, who saw a terrible beast with ten horns. And these kings will reign for only an hour. King of kings: that's the name written on the white rider, in episode forty-seven."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "eaux"),
    ("say", "voix", [
        ("« Les eaux que tu as vues, sur lesquelles la prostituée est assise, ce sont des peuples, des foules, des nations, et des langues. »",
         "\"The waters which thou sawest, where the whore sitteth, are peoples, and multitudes, and nations, and tongues.\""),
    ], "serious"),
    ("cue", "peuples"),
    ("say", "claude", [
        ("Assise sur les eaux, c'est-à-dire sur les peuples : elle domine le monde entier.",
         "Sitting on the waters, that is, on the peoples: she rules over the whole world."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "trahison"),
    ("say", "voix", [
        ("« Les dix cornes que tu as vues et la bête haïront la prostituée, la dépouilleront et la mettront à nu, et la consumeront par le feu. Et la femme que tu as vue, c'est la grande ville qui a la royauté sur les rois de la terre. »",
         "\"And the ten horns which thou sawest upon the beast, these shall hate the whore, and shall make her desolate and naked, and burn her with fire. And the woman which thou sawest is that great city, which reigneth over the kings of the earth.\""),
    ], "serious"),
    ("cue", "retour"),
    ("say", "claude", [
        ("Voilà le retournement. Ce ne sont pas ses ennemis qui la détruisent, ce sont ses propres alliés. Le mal finit par se dévorer lui-même. Et c'est ce feu que les rois pleureront de loin, dans l'épisode cinquante.",
         "Here is the twist. It isn't her enemies who destroy her, it's her own allies. Evil ends up devouring itself. And that's the fire the kings will mourn from afar, in episode fifty."),
    ], "awe"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, un ange emmène Jean dans le désert. Il y voit une femme vêtue de pourpre, une coupe d'or à la main, et un nom écrit sur son front : « Mystère ». Ce sera le prochain épisode.",
         "But this story follows another one. Just before, an angel carries John away into the wilderness. There he sees a woman clothed in purple, a golden cup in her hand, and a name written on her forehead: \"Mystery\". That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
