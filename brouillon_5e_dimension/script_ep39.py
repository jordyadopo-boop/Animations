# Episode 39 - Une 5e dimension se cache peut-etre partout (Kaluza, Klein, cordes, gravite, LHC)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.4),
    ("say", "claude", [
        ("Et si tout notre univers flottait comme une fine membrane… dans un espace plus grand, que personne ne peut voir ?",
         "What if our whole universe floated like a thin membrane… in a bigger space that no one can see?"),
    ], "serious"),
    ("cue", "title"),
    ("title", "UNE 5E DIMENSION SE CACHE\\NPEUT-ÊTRE PARTOUT", "A 5th dimension may be hiding everywhere", 2.8),
    ("pause", 2.6),

    ("scene", "compte"),
    ("say", "claude", [
        ("D'abord, comptons. Trois dimensions pour l'espace : longueur, largeur, hauteur. Pour les physiciens, le temps est la quatrième. La cinquième serait donc la première dimension cachée, une direction de plus, que nos sens ne détectent pas.",
         "First, let's count. Three dimensions of space: length, width, height. For physicists, time is the fourth. So the fifth would be the first hidden dimension, one more direction our senses can't detect."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "kaluza"),
    ("date", "1919 · Königsberg", "1919 · Königsberg", 2.2),
    ("pause", 0.3),
    ("say", "claude", [
        ("L'idée naît en 1919. Un mathématicien presque inconnu, Theodor Kaluza, prend les équations d'Einstein sur la gravité… et leur ajoute une cinquième dimension, juste pour voir.",
         "The idea is born in 1919. An almost unknown mathematician, Theodor Kaluza, takes Einstein's equations of gravity… and adds a fifth dimension to them, just to see."),
    ], "neutral"),
    ("cue", "miracle"),
    ("say", "claude", [
        ("Surprise : de ses calculs sortent, en plus de la gravité, les équations de l'électricité et du magnétisme. Deux forces de la nature réunies d'un coup ! Einstein est impressionné… mais il hésite deux ans avant de faire publier l'article.",
         "Surprise: out of his calculations come, besides gravity, the equations of electricity and magnetism. Two forces of nature united at once! Einstein is impressed… but he hesitates two years before getting the paper published."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "klein"),
    ("say", "claude", [
        ("Reste un problème : si cette dimension existe, où est-elle ? En 1926, le physicien Oskar Klein propose une réponse : elle est enroulée sur elle-même, minuscule.",
         "One problem remains: if this dimension exists, where is it? In 1926, the physicist Oskar Klein offers an answer: it's curled up on itself, tiny."),
    ], "neutral"),
    ("cue", "funambule"),
    ("say", "claude", [
        ("Imagine un funambule sur un câble : pour lui, il n'y a qu'avant ou arrière. Mais une fourmi, elle, peut aussi tourner autour du câble. Une dimension en plus, trop petite pour le funambule.",
         "Picture a tightrope walker on a cable: for him, there's only forward or back. But an ant can also walk around the cable. One extra dimension, too small for the tightrope walker."),
    ], "happy"),
    ("cue", "taille"),
    ("say", "claude", [
        ("Selon ses calculs, la cinquième dimension serait plus de mille milliards de milliards de fois plus petite qu'un atome. Impossible à voir.",
         "According to his calculations, the fifth dimension would be more than a thousand billion billion times smaller than an atom. Impossible to see."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "cordes"),
    ("say", "claude", [
        ("L'idée revient en force avec la théorie des cordes. Selon elle, chaque particule serait une minuscule corde qui vibre, comme une corde de guitare : chaque note donnerait une particule différente.",
         "The idea makes a big comeback with string theory. According to it, every particle would be a tiny vibrating string, like a guitar string: each note would give a different particle."),
    ], "happy"),
    ("cue", "dix"),
    ("say", "claude", [
        ("Mais pour que les calculs fonctionnent, il lui faut dix dimensions. Six seraient enroulées, cachées en chaque point de l'espace… même ici, devant toi.",
         "But for the maths to work, it needs ten dimensions. Six would be curled up, hidden at every point in space… even right here, in front of you."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "gravite"),
    ("say", "claude", [
        ("La cinquième dimension pourrait aussi résoudre une vraie énigme : pourquoi la gravité est-elle si faible ? Un petit aimant soulève un trombone… alors que la Terre entière le tire vers le bas !",
         "The fifth dimension could also solve a real mystery: why is gravity so weak? A small magnet lifts a paperclip… while the entire Earth pulls it down!"),
    ], "neutral"),
    ("cue", "brane"),
    ("say", "claude", [
        ("À la fin des années 1990, des physiciens imaginent que notre univers est une membrane, posée dans un espace à cinq dimensions. La lumière et la matière resteraient collées à la membrane… mais la gravité, elle, s'échapperait dans la cinquième dimension. C'est pour ça qu'on la sentirait si peu.",
         "In the late 1990s, physicists imagine our universe as a membrane, sitting in a five-dimensional space. Light and matter would stay stuck to the membrane… but gravity would leak into the fifth dimension. That's why we'd feel so little of it."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "preuves"),
    ("say", "claude", [
        ("Alors, on l'a trouvée ? Au LHC, le grand accélérateur près de Genève, les chercheurs ont cherché ses traces : de l'énergie qui disparaît, ou de minuscules trous noirs. Rien, pour l'instant.",
         "So, have we found it? At the LHC, the big particle collider near Geneva, researchers have looked for its traces: energy that vanishes, or tiny black holes. Nothing, so far."),
    ], "neutral"),
    ("cue", "pendule"),
    ("say", "claude", [
        ("Et des expériences très précises ont vérifié que la gravité se comporte normalement jusqu'à 52 micromètres, moins que l'épaisseur d'un cheveu.",
         "And very precise experiments have checked that gravity behaves normally down to 52 micrometres, less than the thickness of a hair."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "pop"),
    ("say", "claude", [
        ("Le cinéma, lui, l'adore. Dans Interstellar, le héros se retrouve dans un tesseract construit par des êtres de la cinquième dimension. Et la série culte La Quatrième Dimension, en version originale, commence par : « Il existe une cinquième dimension »…",
         "Cinema loves it. In Interstellar, the hero ends up inside a tesseract built by fifth-dimensional beings. And the cult series The Twilight Zone opens with: \"There is a fifth dimension\"…"),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("Alors, la cinquième dimension existe-t-elle ? Les équations disent : peut-être. Les expériences disent : pas encore vue. Et toi, tu crois qu'on la trouvera un jour ? Dis-le-moi en commentaire.",
         "So, does the fifth dimension exist? The equations say: maybe. The experiments say: not seen yet. And you, do you think we'll find it one day? Tell me in the comments."),
    ], "happy"),
    ("pause", 1.6),
]
