# Episode 27 - Comment ont-ils construit les pyramides ? (grande pyramide de Kheops)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "merer": dict(voice="fr-FR-HenriNeural", rate="+0%", pitch="-2Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.4),
    ("say", "claude", [
        ("2,3 millions de blocs. Certains pèsent plus de 50 tonnes. Pas de fer, pas de grue, pas de roue pour les porter… et pourtant, elle tient debout depuis 4 500 ans.",
         "2.3 million blocks. Some weigh over 50 tonnes. No iron, no cranes, no wheels to carry them… and yet it has stood for 4,500 years."),
    ], "serious"),
    ("cue", "title"),
    ("title", "COMMENT ONT-ILS CONSTRUIT LES PYRAMIDES ?", "How did they build the pyramids?", 2.8),
    ("pause", 2.7),

    ("scene", "kheops"),
    ("date", "Vers 2560 av. J.-C. · Gizeh, Égypte", "Around 2560 BC · Giza, Egypt", 2.6),
    ("pause", 0.4),
    ("say", "claude", [
        ("La grande pyramide a été construite pour le pharaon Khéops. 146 mètres de haut à l'origine : pendant près de 4 000 ans, ce sera le plus haut bâtiment du monde.",
         "The Great Pyramid was built for Pharaoh Khufu. 146 metres tall originally: for nearly 4,000 years, it was the tallest building in the world."),
    ], "neutral"),
    ("cue", "ouvriers"),
    ("say", "claude", [
        ("Et non, ce n'étaient pas des esclaves. On a retrouvé le village des ouvriers, leurs tombes, et même les noms de leurs équipes peints sur les blocs, comme « les amis de Khéops ».",
         "And no, they weren't slaves. We found the workers' village, their tombs, and even their team names painted on the blocks, like \"the Friends of Khufu\"."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "merer"),
    ("say", "claude", [
        ("En 2013, des archéologues découvrent les plus vieux papyrus écrits connus : le journal de bord d'un inspecteur nommé Merer.",
         "In 2013, archaeologists discover the oldest known written papyri: the logbook of an inspector named Merer."),
    ], "neutral"),
    ("cue", "merer_dit"),
    ("say", "merer", [("Nous chargeons la pierre blanche à Tourah, et nous la menons par le fleuve jusqu'à la pyramide.", "We load the white stone at Tura, and take it by river to the pyramid.")], "neutral"),
    ("cue", "nil"),
    ("say", "claude", [("Le calcaire du revêtement voyageait donc en bateau, sur le Nil et ses canaux.", "So the casing limestone travelled by boat, on the Nile and its canals.")], "neutral"),
    ("pause", 0.3),

    ("scene", "traineau"),
    ("say", "claude", [
        ("Sur terre, les blocs glissaient sur des traîneaux en bois. Une peinture dans une tombe égyptienne montre un homme qui verse de l'eau sur le sable, juste devant le traîneau.",
         "On land, the blocks slid on wooden sledges. A painting in an Egyptian tomb shows a man pouring water on the sand, just in front of the sledge."),
    ], "neutral"),
    ("cue", "sable"),
    ("say", "claude", [
        ("En 2014, des physiciens ont compris pourquoi : du sable mouillé juste ce qu'il faut divise par deux environ la force nécessaire pour tirer.",
         "In 2014, physicists understood why: sand wetted just right cuts the pulling force roughly in half."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "rampes"),
    ("say", "claude", [
        ("Pour monter les blocs, on pense à des rampes. Droites, en zigzag, en spirale autour de la pyramide ? Les spécialistes en débattent encore.",
         "To raise the blocks, we think of ramps. Straight, zigzag, spiralling around the pyramid? Experts are still debating."),
    ], "neutral"),
    ("cue", "hatnub"),
    ("say", "claude", [
        ("En 2018, dans une carrière de l'époque de Khéops, on a retrouvé une rampe très raide, bordée d'escaliers et de trous pour des poteaux, où l'on attachait sans doute les cordes.",
         "In 2018, in a quarry from Khufu's time, a very steep ramp was found, lined with stairs and post holes, probably used to tie the ropes."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "nord"),
    ("say", "claude", [
        ("Et la précision est folle : 230 mètres de côté, et une base tournée vers le nord avec une erreur de moins d'un dixième de degré. Sans boussole !",
         "And the precision is insane: 230 metres per side, and a base facing north with an error of less than a tenth of a degree. Without a compass!"),
    ], "happy"),
    ("cue", "etoiles"),
    ("say", "claude", [
        ("Ils ont peut-être visé des étoiles qui tournent autour du pôle, ou suivi l'ombre du soleil. Ce sont des hypothèses.",
         "They may have aimed at stars circling the pole, or followed the sun's shadow. These are hypotheses."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "parement"),
    ("say", "claude", [
        ("À l'origine, elle n'était pas en escalier : un parement de calcaire blanc poli la recouvrait, et elle brillait au soleil. Après un tremblement de terre en 1303, ces pierres ont servi à construire au Caire.",
         "Originally, it wasn't stepped: a casing of polished white limestone covered it, and it shone in the sun. After an earthquake in 1303, those stones were reused to build in Cairo."),
    ], "neutral"),
    ("cue", "planete"),
    ("say", "claude", [
        ("Et sa trace sur la planète ? Environ six millions de tonnes de pierre, des carrières, un port, des canaux : tout un paysage transformé. Les idées d'un alignement sur Orion, ou d'un centre des terres du globe, ne sont pas reconnues par les scientifiques.",
         "And its mark on the planet? About six million tonnes of stone, quarries, a port, canals: a whole landscape transformed. Ideas of an alignment with Orion, or of a centre of the world's land, are not accepted by scientists."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "muons"),
    ("say", "claude", [
        ("En 2017, des physiciens ont « radiographié » la pyramide avec des muons, des particules venues de l'espace. Ils ont découvert un grand vide d'au moins 30 mètres au-dessus de la Grande Galerie. Personne n'y est jamais entré.",
         "In 2017, physicists \"X-rayed\" the pyramid with muons, particles from space. They found a large void at least 30 metres long above the Grand Gallery. No one has ever entered it."),
    ], "serious"),
    ("cue", "couloir"),
    ("say", "claude", [
        ("Et en 2023, une petite caméra a filmé un couloir caché derrière la face nord.",
         "And in 2023, a tiny camera filmed a hidden corridor behind the north face."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("Alors, qu'est-ce qui t'impressionne le plus : les millions de blocs, la précision… ou ce vide que personne n'a encore vu ? Dis-le-moi en commentaire.",
         "So, what impresses you most: the millions of blocks, the precision… or that void no one has seen yet? Tell me in the comments."),
    ], "happy"),
    ("pause", 1.6),
]
