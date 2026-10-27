# Episode 35 - Ton coeur bat 100 000 fois par jour (fonctionnement, tachycardie, bradycardie, entretien, arret cardiaque)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Pose ta main sur ta poitrine. Ce muscle, gros comme ton poing, bat environ 100 000 fois par jour… sans jamais prendre de vacances.",
         "Put your hand on your chest. This muscle, the size of your fist, beats about 100,000 times a day… without ever taking a break."),
    ], "happy"),
    ("cue", "title"),
    ("title", "TON CŒUR BAT\\N100 000 FOIS PAR JOUR", "Your heart beats 100,000 times a day", 2.8),
    ("pause", 2.6),

    ("scene", "pompe"),
    ("say", "claude", [
        ("Le cœur, c'est deux pompes collées. La moitié droite envoie le sang vers les poumons, pour qu'il se charge en oxygène. La moitié gauche, plus musclée, l'envoie dans tout le corps.",
         "The heart is two pumps stuck together. The right half sends blood to the lungs to pick up oxygen. The left half, more muscular, sends it around the whole body."),
    ], "neutral"),
    ("cue", "litres"),
    ("say", "claude", [
        ("Au repos, environ cinq litres par minute : à peu près tout ton sang, en une minute.",
         "At rest, about five litres per minute: roughly all of your blood, in one minute."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "electrique"),
    ("say", "claude", [
        ("Et qui donne le rythme ? Une petite zone en haut du cœur : le nœud sinusal. Il envoie une décharge électrique. Les oreillettes se contractent… puis les ventricules.",
         "And who sets the rhythm? A small spot at the top of the heart: the sinus node. It sends an electrical signal. The atria contract… then the ventricles."),
    ], "neutral"),
    ("cue", "boum"),
    ("say", "claude", [
        ("Et le fameux « boum-boum », c'est le bruit des valves qui se ferment.",
         "And the famous \"lub-dub\" is the sound of the valves closing."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "tachy"),
    ("say", "claude", [
        ("Au repos, un adulte a en général entre 60 et 100 battements par minute. Au-dessus, on parle de tachycardie. Souvent, c'est normal : un effort, une émotion, de la fièvre, trop de café.",
         "At rest, an adult usually has between 60 and 100 beats per minute. Above that, it's called tachycardia. Often it's normal: exercise, emotion, fever, too much coffee."),
    ], "neutral"),
    ("cue", "court"),
    ("say", "claude", [
        ("Mais parfois, c'est un court-circuit électrique : le cœur s'emballe sans raison.",
         "But sometimes it's an electrical short circuit: the heart races for no reason."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "brady"),
    ("say", "claude", [
        ("En dessous de 60, c'est la bradycardie. Chez un sportif, c'est souvent bon signe : son cœur, plus fort, envoie plus de sang à chaque battement.",
         "Below 60, it's bradycardia. In an athlete, it's often a good sign: their stronger heart pumps more blood with each beat."),
    ], "happy"),
    ("cue", "bloc"),
    ("say", "claude", [
        ("Mais si le signal électrique se bloque en chemin, le cœur ralentit trop : fatigue, vertiges, malaises.",
         "But if the electrical signal gets blocked on the way, the heart slows down too much: tiredness, dizziness, fainting."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "forme"),
    ("say", "claude", [
        ("Pour le garder en forme : bouger au moins deux heures et demie par semaine, ne pas fumer, manger moins salé, bien dormir et surveiller sa tension.",
         "To keep it in shape: move at least two and a half hours a week, don't smoke, eat less salt, sleep well and keep an eye on your blood pressure."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "arret"),
    ("say", "claude", [
        ("Et quand le cœur s'arrête ? Le sang ne circule plus. Privé d'oxygène, le cerveau perd connaissance en quelques secondes, et commence à s'abîmer au bout de quelques minutes.",
         "And when the heart stops? Blood no longer flows. Deprived of oxygen, the brain loses consciousness within seconds, and starts to be damaged after a few minutes."),
    ], "serious"),
    ("cue", "massage"),
    ("say", "claude", [
        ("C'est pour ça qu'un massage cardiaque et un défibrillateur, tout de suite, peuvent sauver une vie.",
         "That's why chest compressions and a defibrillator, right away, can save a life."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("Et toi, tu saurais faire un massage cardiaque ? Dis-le-moi en commentaire.",
         "And you, would you know how to do chest compressions? Tell me in the comments."),
    ], "happy"),
    ("pause", 1.6),
]
