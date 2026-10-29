# Episode 47 - Un cavalier blanc sort du ciel (Apocalypse 19, 11-21) - on remonte la Bible scene par scene
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Le ciel se déchire. Un cavalier en descend sur un cheval blanc. Ses yeux sont des flammes… et l'épée qu'il porte ne sort pas de sa main, mais de sa bouche.",
         "The sky tears open. A rider comes down on a white horse. His eyes are flames… and the sword he carries comes not from his hand, but from his mouth."),
    ], "serious"),
    ("cue", "serie"),
    ("say", "claude", [
        ("On remonte la Bible, scène par scène. La dernière fois, un ange enchaînait le dragon. Juste avant, c'est la plus grande apparition de toute l'Apocalypse.",
         "We're going back through the Bible, scene by scene. Last time, an angel chained the dragon. Just before, comes the greatest appearance in all of Revelation."),
    ], "happy"),
    ("cue", "title"),
    ("title", "UN CAVALIER BLANC\\NSORT DU CIEL", "A white rider comes out of heaven", 2.8),
    ("pause", 2.6),

    ("scene", "cavalier"),
    ("say", "voix", [
        ("« Puis je vis le ciel ouvert, et voici, parut un cheval blanc. Celui qui le montait s'appelle Fidèle et Véritable, et il juge et combat avec justice. »",
         "\"And I saw heaven opened, and behold a white horse; and he that sat upon him was called Faithful and True, and in righteousness he doth judge and make war.\""),
    ], "serious"),
    ("cue", "triomphe"),
    ("say", "claude", [
        ("Un cheval blanc, c'était la monture des généraux romains victorieux, lors de leur triomphe. Et pourtant, dans les Évangiles, Jésus entrait à Jérusalem… sur un petit âne.",
         "A white horse was the mount of victorious Roman generals, in their triumph. And yet, in the Gospels, Jesus entered Jerusalem… on a little donkey."),
    ], "neutral"),
    ("cue", "zacharie"),
    ("say", "claude", [
        ("Le prophète Zacharie l'avait annoncé : « Ton roi vient à toi, humble et monté sur un âne. » La première fois, il venait en paix. Ici, il revient en vainqueur.",
         "The prophet Zechariah had foretold it: \"Thy King cometh unto thee, lowly, and riding upon an ass.\" The first time, he came in peace. Here, he returns as a victor."),
    ], "awe"),
    ("say", "voix", [
        ("« Ses yeux étaient comme une flamme de feu ; sur sa tête étaient plusieurs diadèmes ; il avait un nom écrit, que personne ne connaît, si ce n'est lui-même. »",
         "\"His eyes were as a flame of fire, and on his head were many crowns; and he had a name written, that no man knew, but he himself.\""),
    ], "serious"),
    ("cue", "diademes"),
    ("say", "claude", [
        ("Plusieurs couronnes à la fois : celles de tous les royaumes. Le dragon en portait sept. Lui, on ne les compte même pas.",
         "Many crowns at once: those of every kingdom. The dragon wore seven. His are not even counted."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "noms"),
    ("say", "voix", [
        ("« Il était revêtu d'un vêtement teint de sang. Son nom est la Parole de Dieu. »",
         "\"And he was clothed with a vesture dipped in blood: and his name is called The Word of God.\""),
    ], "serious"),
    ("cue", "sang"),
    ("say", "claude", [
        ("Du sang, avant même le combat ? Les lecteurs en discutent : le sang de ses ennemis, comme chez le prophète Isaïe, ou son propre sang, celui de l'Agneau.",
         "Blood, even before the fight? Readers debate it: the blood of his enemies, as in the prophet Isaiah, or his own blood, that of the Lamb."),
    ], "neutral"),
    ("cue", "parole"),
    ("say", "claude", [
        ("Et ce nom, la Parole de Dieu, n'est pas choisi au hasard. Le même Jean commence son Évangile par : « Au commencement était la Parole. »",
         "And that name, the Word of God, is no accident. The same John begins his Gospel with: \"In the beginning was the Word.\""),
    ], "awe"),
    ("cue", "roi"),
    ("say", "claude", [
        ("Sur son vêtement, un dernier nom est écrit, bien visible : Roi des rois et Seigneur des seigneurs.",
         "On his garment, one last name is written, plain to see: King of kings and Lord of lords."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "armee"),
    ("say", "voix", [
        ("« Les armées qui sont dans le ciel le suivaient sur des chevaux blancs, revêtues d'un fin lin, blanc, pur. De sa bouche sortait une épée aiguë, pour frapper les nations. »",
         "\"And the armies which were in heaven followed him upon white horses, clothed in fine linen, white and clean. And out of his mouth goeth a sharp sword, that with it he should smite the nations.\""),
    ], "serious"),
    ("cue", "lin"),
    ("say", "claude", [
        ("Regardez cette armée : pas d'armure, pas d'armes. Du lin blanc, comme pour une fête. Ils ne combattent pas.",
         "Look at this army: no armour, no weapons. White linen, as for a celebration. They don't fight."),
    ], "neutral"),
    ("cue", "epee"),
    ("say", "claude", [
        ("Et l'épée sort de sa bouche : c'est sa parole qui est l'arme. Isaïe disait déjà que le Messie frapperait la terre par la parole de sa bouche.",
         "And the sword comes out of his mouth: his word is the weapon. Isaiah had already said the Messiah would strike the earth with the word of his mouth."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "bete"),
    ("say", "claude", [
        ("Puis Jean voit un ange debout dans le soleil. Il appelle tous les oiseaux du ciel au « grand festin de Dieu ». Un festin terrible, à l'opposé de l'autre repas annoncé juste avant : les noces de l'Agneau.",
         "Then John sees an angel standing in the sun. He calls all the birds of heaven to \"the supper of the great God\". A terrible feast, the opposite of the other meal announced just before: the marriage supper of the Lamb."),
    ], "serious"),
    ("cue", "guerre"),
    ("say", "claude", [
        ("En face, la bête et les rois de la terre rassemblent leurs armées pour lui faire la guerre. Et là encore… il n'y a pas de bataille.",
         "Facing him, the beast and the kings of the earth gather their armies to make war on him. And here again… there is no battle."),
    ], "serious"),
    ("say", "voix", [
        ("« Et la bête fut prise, et avec elle le faux prophète. Ils furent tous les deux jetés vivants dans l'étang ardent de feu et de soufre. »",
         "\"And the beast was taken, and with him the false prophet. These both were cast alive into a lake of fire burning with brimstone.\""),
    ], "serious"),
    ("cue", "premiers"),
    ("say", "claude", [
        ("Ce sont les tout premiers jetés dans l'étang de feu. Voilà pourquoi, deux épisodes plus tard, le diable les y retrouvera.",
         "They are the very first to be thrown into the lake of fire. That's why, two episodes later, the devil will find them there."),
    ], "neutral"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, une foule immense crie « Alléluia » dans le ciel. On annonce un mariage : les noces de l'Agneau. Ce sera le prochain épisode.",
         "But this story follows another one. Just before, a huge crowd cries \"Alleluia\" in heaven. A wedding is announced: the marriage of the Lamb. That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
