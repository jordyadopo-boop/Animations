# Episode 53 - Un nom ecrit sur son front : Mystere (Apocalypse 17, 1-6) - on remonte la Bible scene par scene
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Une femme couverte d'or, assise sur une bête rouge, une coupe à la main. Et sur son front, un seul mot : Mystère.",
         "A woman covered in gold, sitting on a red beast, a cup in her hand. And on her forehead, a single word: Mystery."),
    ], "serious"),
    ("cue", "serie"),
    ("say", "claude", [
        ("On remonte la Bible, scène par scène. La dernière fois, un ange expliquait à Jean le mystère de cette femme. Juste avant, voici le moment où il la voit pour la première fois.",
         "We're going back through the Bible, scene by scene. Last time, an angel explained this woman's mystery to John. Just before, here is the moment he sees her for the first time."),
    ], "neutral"),
    ("cue", "title"),
    ("title", "UN NOM ÉCRIT SUR SON FRONT :\\NMYSTÈRE", "A name written on her forehead: Mystery", 2.8),
    ("pause", 2.6),

    ("scene", "appel"),
    ("say", "voix", [
        ("« Puis un des sept anges qui tenaient les sept coupes vint, et il m'adressa la parole, en disant : Viens, je te montrerai le jugement de la grande prostituée qui est assise sur les grandes eaux. »",
         "\"And there came one of the seven angels which had the seven vials, and talked with me, saying unto me, Come hither; I will shew unto thee the judgment of the great whore that sitteth upon many waters.\""),
    ], "serious"),
    ("cue", "coupes"),
    ("say", "claude", [
        ("Cet ange, on le connaît : c'est l'un des sept qui viennent de verser sur la terre les sept dernières coupes de la colère de Dieu.",
         "We know this angel: he is one of the seven who have just poured the seven last bowls of God's wrath upon the earth."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "desert"),
    ("say", "voix", [
        ("« Il me transporta en esprit dans un désert. Et je vis une femme assise sur une bête écarlate, pleine de noms de blasphème, ayant sept têtes et dix cornes. »",
         "\"So he carried me away in the spirit into the wilderness: and I saw a woman sit upon a scarlet coloured beast, full of names of blasphemy, having seven heads and ten horns.\""),
    ], "serious"),
    ("cue", "blaspheme"),
    ("say", "claude", [
        ("Des noms de blasphème : à l'époque, les empereurs romains se faisaient appeler « divin » ou « fils de dieu ». Et selon l'historien Suétone, Domitien exigeait qu'on l'appelle « notre seigneur et notre dieu ».",
         "Names of blasphemy: at the time, Roman emperors had themselves called \"divine\" or \"son of god\". And according to the historian Suetonius, Domitian demanded to be called \"our lord and our god\"."),
    ], "neutral"),
    ("cue", "femmes"),
    ("say", "claude", [
        ("Dans l'Apocalypse, il y a deux femmes qui s'opposent : celle-ci, et l'épouse de l'Agneau, vêtue de fin lin blanc, celle de l'épisode quarante-huit.",
         "In Revelation, there are two women who stand in contrast: this one, and the bride of the Lamb, clothed in fine white linen, from episode forty-eight."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "parure"),
    ("say", "voix", [
        ("« Cette femme était vêtue de pourpre et d'écarlate, et parée d'or, de pierres précieuses et de perles. Elle tenait dans sa main une coupe d'or, remplie d'abominations. »",
         "\"And the woman was arrayed in purple and scarlet colour, and decked with gold and precious stones and pearls, having a golden cup in her hand full of abominations.\""),
    ], "serious"),
    ("cue", "murex"),
    ("say", "claude", [
        ("La pourpre, c'était la couleur la plus chère du monde antique. On la tirait d'un petit coquillage, le murex : il en fallait des milliers pour teindre un seul manteau.",
         "Purple was the most expensive colour in the ancient world. It came from a small sea snail, the murex: it took thousands of them to dye a single cloak."),
    ], "neutral"),
    ("cue", "perle"),
    ("say", "claude", [
        ("Et les perles valaient des fortunes. Pline l'Ancien raconte que la reine Cléopâtre en aurait dissous une dans du vinaigre, juste pour gagner un pari.",
         "And pearls were worth fortunes. Pliny the Elder tells that Queen Cleopatra dissolved one in vinegar, just to win a bet."),
    ], "awe"),
    ("cue", "coupe"),
    ("say", "claude", [
        ("Et cette coupe d'or vient encore de Jérémie : « Babylone était dans la main de l'Éternel une coupe d'or, qui enivrait toute la terre. »",
         "And this golden cup comes from Jeremiah again: \"Babylon hath been a golden cup in the Lord's hand, that made all the earth drunken.\""),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "front"),
    ("say", "voix", [
        ("« Sur son front était écrit un nom, un mystère : Babylone la grande, la mère des impudiques et des abominations de la terre. »",
         "\"And upon her forehead was a name written, MYSTERY, BABYLON THE GREAT, THE MOTHER OF HARLOTS AND ABOMINATIONS OF THE EARTH.\""),
    ], "serious"),
    ("cue", "seneque"),
    ("say", "claude", [
        ("Un nom sur le front, ça avait un sens précis. Selon l'écrivain romain Sénèque, les prostituées de Rome affichaient leur nom sur un bandeau, au-dessus des yeux.",
         "A name on the forehead had a precise meaning. According to the Roman writer Seneca, the prostitutes of Rome displayed their name on a band, above their eyes."),
    ], "neutral"),
    ("cue", "fideles"),
    ("say", "claude", [
        ("Et dans l'Apocalypse, ceux qui sont fidèles portent eux aussi un nom sur le front : celui de Dieu. Chacun porte le nom de celui à qui il appartient.",
         "And in Revelation, the faithful also bear a name on their forehead: God's name. Each one bears the name of the one they belong to."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "ivre"),
    ("say", "voix", [
        ("« Et je vis cette femme ivre du sang des saints et du sang des témoins de Jésus. Et, en la voyant, je fus saisi d'un grand étonnement. »",
         "\"And I saw the woman drunken with the blood of the saints, and with the blood of the martyrs of Jesus: and when I saw her, I wondered with great admiration.\""),
    ], "serious"),
    ("cue", "etonne"),
    ("say", "claude", [
        ("Jean est stupéfait. Et c'est justement là que l'ange lui demande : « Pourquoi t'étonnes-tu ? » C'était le début de l'épisode cinquante-deux.",
         "John is stunned. And that's exactly when the angel asks him: \"Wherefore didst thou marvel?\" That was the start of episode fifty-two."),
    ], "neutral"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, le septième ange verse sa coupe dans les airs. Une voix crie : « C'en est fait ! » La terre tremble comme jamais, et la grande ville se brise en trois. Ce sera le prochain épisode.",
         "But this story follows another one. Just before, the seventh angel pours out his bowl into the air. A voice cries: \"It is done!\" The earth shakes as never before, and the great city splits into three. That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
