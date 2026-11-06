# Episode 51 - Elle est tombee, Babylone la grande (Apocalypse 18, 1-8) - on remonte la Bible scene par scene
# Premier episode en animation 2D (Animation Studio). Citations : Louis Segond 1910 ; King James (sous-titres anglais).
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Un ange si lumineux que toute la terre s'éclaire. Et d'une voix forte, il annonce la chute de la ville la plus puissante du monde… avant même qu'elle ne brûle.",
         "An angel so bright that the whole earth lights up. And with a mighty voice, he announces the fall of the most powerful city in the world… before it even burns."),
    ], "serious"),
    ("cue", "serie"),
    ("say", "claude", [
        ("On remonte la Bible, scène par scène. La dernière fois, les rois et les marchands pleuraient la ville en feu. Juste avant, voici l'annonce.",
         "We're going back through the Bible, scene by scene. Last time, kings and merchants wept over the burning city. Just before, here is the announcement."),
    ], "neutral"),
    ("cue", "title"),
    ("title", "ELLE EST TOMBÉE,\\NBABYLONE LA GRANDE", "Babylon the great is fallen", 2.8),
    ("pause", 2.6),

    ("scene", "ange"),
    ("say", "voix", [
        ("« Après cela, je vis descendre du ciel un autre ange, qui avait une grande autorité ; et la terre fut éclairée de sa gloire. »",
         "\"And after these things I saw another angel come down from heaven, having great power; and the earth was lightened with his glory.\""),
    ], "serious"),
    ("cue", "gloire"),
    ("say", "claude", [
        ("Ce n'est pas un ange parmi d'autres. Sa lumière suffit à éclairer la terre entière, comme un second soleil.",
         "This is not just any angel. His light is enough to brighten the whole earth, like a second sun."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "cri"),
    ("say", "voix", [
        ("« Il cria d'une voix forte, disant : Elle est tombée, elle est tombée, Babylone la grande ! »",
         "\"And he cried mightily with a strong voice, saying, Babylon the great is fallen, is fallen.\""),
    ], "serious"),
    ("cue", "isaie"),
    ("say", "claude", [
        ("Ce cri vient tout droit du prophète Isaïe. Bien des siècles plus tôt, une sentinelle voyait arriver un messager et criait déjà : « Elle est tombée, elle est tombée, Babylone ! »",
         "This cry comes straight from the prophet Isaiah. Many centuries earlier, a watchman saw a messenger coming and was already crying: \"Babylon is fallen, is fallen!\""),
    ], "awe"),
    ("cue", "cyrus"),
    ("say", "claude", [
        ("Et la vraie Babylone est bien tombée, en cinq cent trente-neuf avant notre ère, prise par le roi perse Cyrus. Selon l'historien Hérodote, ses soldats sont entrés par le lit du fleuve, pendant que la ville faisait la fête.",
         "And the real Babylon did fall, in 539 BC, taken by the Persian king Cyrus. According to the historian Herodotus, his soldiers came in through the riverbed, while the city was feasting."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "oiseaux"),
    ("say", "voix", [
        ("« Elle est devenue une habitation de démons, un repaire de tout esprit impur, un repaire de tout oiseau impur et odieux. »",
         "\"And is become the habitation of devils, and the hold of every foul spirit, and a cage of every unclean and hateful bird.\""),
    ], "serious"),
    ("cue", "ruines"),
    ("say", "claude", [
        ("Là aussi, Isaïe l'avait décrit : dans les ruines de Babylone, les hiboux rempliraient les maisons et les chacals hurleraient dans les palais.",
         "Here too, Isaiah had described it: in the ruins of Babylon, owls would fill the houses and jackals would howl in the palaces."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "sortez"),
    ("say", "voix", [
        ("« Puis j'entendis du ciel une autre voix qui disait : Sortez du milieu d'elle, mon peuple, afin que vous ne participiez point à ses péchés. Car ses péchés se sont accumulés jusqu'au ciel. »",
         "\"And I heard another voice from heaven, saying, Come out of her, my people, that ye be not partakers of her sins. For her sins have reached unto heaven.\""),
    ], "serious"),
    ("cue", "jeremie"),
    ("say", "claude", [
        ("C'est l'appel du prophète Jérémie aux Juifs exilés à Babylone : « Sortez du milieu d'elle, mon peuple ! » Ici, il ne s'agit plus seulement de quitter une ville, mais de ne pas lui ressembler.",
         "It is the call of the prophet Jeremiah to the Jews exiled in Babylon: \"My people, go ye out of the midst of her!\" Here, it's no longer just about leaving a city, but about not becoming like her."),
    ], "neutral"),
    ("cue", "babel"),
    ("say", "claude", [
        ("Et ces péchés empilés « jusqu'au ciel », certains lecteurs y entendent un écho de la tour de Babel, qui voulait elle aussi toucher le ciel.",
         "And those sins piled \"up to heaven\": some readers hear in them an echo of the tower of Babel, which also wanted to reach heaven."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "reine"),
    ("say", "voix", [
        ("« Parce qu'elle dit en son cœur : Je suis assise en reine, je ne suis point veuve, et je ne verrai point de deuil ! À cause de cela, en un même jour, ses fléaux arriveront, la mort, le deuil et la famine, et elle sera consumée par le feu. »",
         "\"For she saith in her heart, I sit a queen, and am no widow, and shall see no sorrow. Therefore shall her plagues come in one day, death, and mourning, and famine; and she shall be utterly burned with fire.\""),
    ], "serious"),
    ("cue", "orgueil"),
    ("say", "claude", [
        ("Tout est dans cette phrase : « Je suis assise en reine. » Babylone se croit intouchable. Et c'est ce jour même que tout bascule, ce feu que les rois regarderont brûler de loin, dans l'épisode cinquante.",
         "It's all in that sentence: \"I sit a queen.\" Babylon thinks she is untouchable. And on that very day everything turns, the fire that the kings will watch burning from afar, in episode fifty."),
    ], "serious"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, un ange révèle à Jean le secret de la femme assise sur la bête aux sept têtes… et de dix rois qui finiront par la haïr. Ce sera le prochain épisode.",
         "But this story follows another one. Just before, an angel reveals to John the secret of the woman sitting on the seven-headed beast… and of ten kings who will end up hating her. That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
