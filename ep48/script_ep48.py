# Episode 48 - Le ciel entier crie Alleluia (Apocalypse 19, 1-10) - on remonte la Bible scene par scene
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Une foule immense, impossible à compter. Toutes ses voix crient le même mot… et c'est la seule fois de tout le Nouveau Testament qu'on l'entend.",
         "A huge crowd, impossible to count. All its voices cry out the same word… and it's the only time in the whole New Testament that we hear it."),
    ], "awe"),
    ("cue", "serie"),
    ("say", "claude", [
        ("On remonte la Bible, scène par scène. La dernière fois, un cavalier blanc sortait du ciel. Juste avant, le ciel tout entier se met à chanter.",
         "We're going back through the Bible, scene by scene. Last time, a white rider came out of heaven. Just before, the whole of heaven starts to sing."),
    ], "happy"),
    ("cue", "title"),
    ("title", "LE CIEL ENTIER\\NCRIE ALLÉLUIA", "All heaven cries Alleluia", 2.8),
    ("pause", 2.6),

    ("scene", "alleluia"),
    ("say", "voix", [
        ("« Après cela, j'entendis dans le ciel comme une voix forte d'une foule nombreuse qui disait : Alléluia ! Le salut, la gloire, et la puissance sont à notre Dieu. »",
         "\"And after these things I heard a great voice of much people in heaven, saying, Alleluia; Salvation, and glory, and honour, and power, unto the Lord our God.\""),
    ], "serious"),
    ("cue", "hebreu"),
    ("say", "claude", [
        ("Alléluia, c'est de l'hébreu : « Hallelou-Yah », qui veut dire « louez Yah », le nom de Dieu en abrégé.",
         "Alleluia is Hebrew: \"Hallelu-Yah\", meaning \"praise Yah\", the short form of God's name."),
    ], "neutral"),
    ("cue", "psaumes"),
    ("say", "claude", [
        ("On le trouve souvent dans les Psaumes. Mais dans le Nouveau Testament, il n'apparaît qu'ici : quatre fois, dans ces quelques versets.",
         "It is found often in the Psalms. But in the New Testament, it appears only here: four times, in these few verses."),
    ], "awe"),
    ("cue", "babylone"),
    ("say", "claude", [
        ("Pourquoi cette fête ? Parce que Babylone, la grande prostituée, vient d'être jugée. Et la foule le redit : « Alléluia ! Sa fumée monte aux siècles des siècles. »",
         "Why this celebration? Because Babylon, the great whore, has just been judged. And the crowd says it again: \"Alleluia! Her smoke rose up for ever and ever.\""),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "trone"),
    ("say", "voix", [
        ("« Et les vingt-quatre vieillards et les quatre êtres vivants se prosternèrent et adorèrent Dieu assis sur le trône, en disant : Amen ! Alléluia ! »",
         "\"And the four and twenty elders and the four beasts fell down and worshipped God that sat on the throne, saying, Amen; Alleluia.\""),
    ], "serious"),
    ("cue", "anciens"),
    ("say", "claude", [
        ("On les connaît depuis le chapitre quatre : vingt-quatre anciens couronnés autour du trône, et quatre êtres vivants, avec une tête de lion, de veau, d'homme et d'aigle.",
         "We've known them since chapter four: twenty-four crowned elders around the throne, and four living creatures, with the face of a lion, a calf, a man and an eagle."),
    ], "neutral"),
    ("cue", "eaux"),
    ("say", "voix", [
        ("« Et j'entendis comme une voix d'une foule nombreuse, comme un bruit de grosses eaux, et comme un bruit de forts tonnerres, disant : Alléluia ! Car le Seigneur notre Dieu tout-puissant est entré dans son règne. »",
         "\"And I heard as it were the voice of a great multitude, and as the voice of many waters, and as the voice of mighty thunderings, saying, Alleluia: for the Lord God omnipotent reigneth.\""),
    ], "serious"),
    ("cue", "handel"),
    ("say", "claude", [
        ("Cette phrase, vous l'avez sûrement déjà entendue. En mille sept cent quarante et un, le compositeur Haendel en fait le célèbre chœur « Hallelujah » de son oratorio, le Messie.",
         "You have surely heard this sentence before. In 1741, the composer Handel turned it into the famous \"Hallelujah\" chorus of his oratorio, Messiah."),
    ], "happy"),
    ("cue", "debout"),
    ("say", "claude", [
        ("Et selon une tradition, le roi d'Angleterre se serait levé en l'entendant. Depuis, dans beaucoup de salles, le public se lève encore.",
         "And according to tradition, the King of England stood up when he heard it. Since then, in many concert halls, the audience still rises."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "noces"),
    ("say", "voix", [
        ("« Réjouissons-nous, et donnons-lui gloire ; car les noces de l'agneau sont venues, et son épouse s'est préparée, et il lui a été donné de se revêtir d'un fin lin, éclatant, pur. »",
         "\"Let us be glad and rejoice, and give honour to him: for the marriage of the Lamb is come, and his wife hath made herself ready. And to her was granted that she should be arrayed in fine linen, clean and white.\""),
    ], "serious"),
    ("cue", "epouse"),
    ("say", "claude", [
        ("Un mariage ? L'Agneau, c'est le Christ. Et son épouse, selon la plupart des lecteurs, c'est l'ensemble de ceux qui lui sont fidèles.",
         "A wedding? The Lamb is Christ. And his bride, according to most readers, is the whole company of those who are faithful to him."),
    ], "neutral"),
    ("cue", "lin"),
    ("say", "claude", [
        ("Le texte explique lui-même la robe : « le fin lin, ce sont les œuvres justes des saints ». Tout le contraire de la prostituée, vêtue de pourpre et d'écarlate.",
         "The text itself explains the dress: \"the fine linen is the righteousness of saints\". The very opposite of the whore, clothed in purple and scarlet."),
    ], "awe"),
    ("cue", "cana"),
    ("say", "claude", [
        ("Et ce n'est pas un hasard : dans l'Évangile de Jean, le tout premier miracle de Jésus a lieu pendant un mariage, à Cana. La Bible commence par un couple, et se termine par des noces.",
         "And it's no accident: in John's Gospel, Jesus' very first miracle takes place at a wedding, in Cana. The Bible begins with a couple, and ends with a wedding."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "ange"),
    ("say", "voix", [
        ("« Et l'ange me dit : Écris : Heureux ceux qui sont appelés au festin de noces de l'agneau ! »",
         "\"And he saith unto me, Write, Blessed are they which are called unto the marriage supper of the Lamb.\""),
    ], "serious"),
    ("cue", "tombe"),
    ("say", "claude", [
        ("Alors Jean, bouleversé, tombe aux pieds de l'ange pour l'adorer. Mais l'ange l'arrête aussitôt.",
         "Then John, overwhelmed, falls at the angel's feet to worship him. But the angel stops him at once."),
    ], "serious"),
    ("cue", "garde"),
    ("say", "voix", [
        ("« Garde-toi de le faire ! Je suis ton compagnon de service. Adore Dieu. »",
         "\"See thou do it not: I am thy fellowservant. Worship God.\""),
    ], "serious"),
    ("cue", "deuxfois"),
    ("say", "claude", [
        ("Et le plus étonnant, c'est que Jean refera exactement la même erreur trois chapitres plus loin. C'était l'épisode quarante : l'ange qui refusa d'être adoré.",
         "And the most surprising part is that John will make exactly the same mistake three chapters later. That was episode forty: the angel who refused to be worshipped."),
    ], "awe"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, un ange puissant soulève une pierre aussi grande qu'une meule, et la jette dans la mer. Ce sera le prochain épisode.",
         "But this story follows another one. Just before, a mighty angel lifts a stone as big as a millstone, and throws it into the sea. That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
