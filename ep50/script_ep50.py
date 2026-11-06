# Episode 50 - Tout perdu en une seule heure (Apocalypse 18, 9-20) - on remonte la Bible scene par scene
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Des rois qui pleurent. Des marchands ruinés. Des marins qui se jettent de la poussière sur la tête. Et tous regardent la même chose, de très loin : une ville qui brûle.",
         "Kings weeping. Merchants ruined. Sailors throwing dust on their heads. And they are all watching the same thing, from very far away: a city on fire."),
    ], "serious"),
    ("cue", "serie"),
    ("say", "claude", [
        ("On remonte la Bible, scène par scène. La dernière fois, un ange jetait une meule dans la mer. Juste avant, voici ceux qui pleurent Babylone.",
         "We're going back through the Bible, scene by scene. Last time, an angel threw a millstone into the sea. Just before, here are those who mourn Babylon."),
    ], "neutral"),
    ("cue", "title"),
    ("title", "{\\fs46\\c&HFFFFFF&}LES ROIS ET LES MARCHANDS\\NPLEURENT DE LOIN\\N{\\fs104\\c&H7797D9&}TOUT PERDU\\NEN UNE SEULE HEURE", "All lost in a single hour", 3.4),
    ("pause", 3.2),

    ("scene", "rois"),
    ("say", "voix", [
        ("« Et tous les rois de la terre pleureront et se lamenteront à cause d'elle, quand ils verront la fumée de son embrasement. Se tenant éloignés, dans la crainte de son tourment, ils diront : Malheur ! malheur ! La grande ville ! En une seule heure est venu ton jugement ! »",
         "\"And the kings of the earth shall bewail her, and lament for her, when they shall see the smoke of her burning, standing afar off for the fear of her torment, saying, Alas, alas that great city! for in one hour is thy judgment come.\""),
    ], "serious"),
    ("cue", "loin"),
    ("say", "claude", [
        ("Remarquez : personne ne vient l'aider. Ils pleurent, mais ils restent loin. Ils ont peur que le feu les atteigne.",
         "Notice: nobody comes to help her. They weep, but they stay far away. They are afraid the fire will reach them."),
    ], "neutral"),
    ("cue", "heure"),
    ("say", "claude", [
        ("Et une expression revient trois fois dans ce passage : « en une seule heure ». Des siècles de richesse… effacés en une heure.",
         "And one phrase comes back three times in this passage: \"in one hour\". Centuries of wealth… wiped out in an hour."),
    ], "awe"),
    ("cue", "neron"),
    ("say", "claude", [
        ("Les premiers lecteurs pensaient peut-être au grand incendie de Rome, en l'an soixante-quatre, sous l'empereur Néron. La ville a brûlé pendant six jours.",
         "The first readers may have thought of the great fire of Rome, in the year sixty-four, under the emperor Nero. The city burned for six days."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "marchands"),
    ("say", "voix", [
        ("« Et les marchands de la terre pleurent et sont dans le deuil à cause d'elle, parce que personne n'achète plus leur cargaison : cargaison d'or, d'argent, de pierres précieuses, de perles, de fin lin, de pourpre, de soie, d'écarlate… »",
         "\"And the merchants of the earth shall weep and mourn over her; for no man buyeth their merchandise any more: the merchandise of gold, and silver, and precious stones, and of pearls, and fine linen, and purple, and silk, and scarlet…\""),
    ], "serious"),
    ("cue", "liste"),
    ("say", "claude", [
        ("La liste continue, presque trente marchandises : de l'ivoire, du marbre, de la cannelle, de l'encens, du vin, du blé, des chevaux, des chars.",
         "The list goes on, almost thirty goods: ivory, marble, cinnamon, incense, wine, wheat, horses, chariots."),
    ], "neutral"),
    ("cue", "soie"),
    ("say", "claude", [
        ("Et ce n'est pas inventé. La soie venait de Chine, la cannelle d'Asie, l'ivoire d'Afrique. Tout le commerce du monde convergeait vers la capitale de l'Empire.",
         "And it's not made up. Silk came from China, cinnamon from Asia, ivory from Africa. All the trade of the world flowed toward the capital of the Empire."),
    ], "awe"),
    ("cue", "ames"),
    ("say", "claude", [
        ("Mais le dernier mot de la liste fait froid dans le dos : « des corps et des âmes d'hommes ». Ce sont des esclaves. Et l'Empire romain en comptait des millions.",
         "But the last word of the list sends a chill down the spine: \"slaves, and souls of men\". These are slaves. And the Roman Empire held millions of them."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "marins"),
    ("say", "voix", [
        ("« Et tous les pilotes, et tous les marins, se tenaient éloignés, et ils s'écriaient en voyant la fumée de son embrasement : Quelle ville était semblable à la grande ville ? Et ils jetaient de la poussière sur leur tête. »",
         "\"And every shipmaster, and sailors, stood afar off, and cried when they saw the smoke of her burning, saying, What city is like unto this great city! And they cast dust on their heads.\""),
    ], "serious"),
    ("cue", "tyr"),
    ("say", "claude", [
        ("Ce chant de deuil a un modèle. Chez le prophète Ézéchiel, les marins pleuraient déjà une autre grande ville marchande, Tyr : « Qui était comme Tyr ? »",
         "This lament has a model. In the prophet Ezekiel, sailors were already mourning another great merchant city, Tyre: \"What city is like Tyrus?\""),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "ciel"),
    ("say", "voix", [
        ("« Ciel, réjouis-toi sur elle ! Et vous, les saints, les apôtres, et les prophètes, réjouissez-vous aussi ! Car Dieu vous a fait justice en la jugeant. »",
         "\"Rejoice over her, thou heaven, and ye holy apostles and prophets; for God hath avenged you on her.\""),
    ], "serious"),
    ("cue", "contraste"),
    ("say", "claude", [
        ("Sur la terre, on pleure ce qu'on a perdu. Dans le ciel, on se réjouit de la justice. Et c'est cet appel qui fera éclater, juste après, le grand Alléluia de l'épisode quarante-huit.",
         "On earth, they weep for what they lost. In heaven, they rejoice over justice. And it is this call that will set off, just after, the great Alleluia of episode forty-eight."),
    ], "awe"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, un ange descend du ciel, si lumineux que toute la terre en est éclairée, et il crie : « Elle est tombée, Babylone la grande ! » Ce sera le prochain épisode.",
         "But this story follows another one. Just before, an angel comes down from heaven, so bright that the whole earth is lit by him, and he cries: \"Babylon the great is fallen!\" That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
