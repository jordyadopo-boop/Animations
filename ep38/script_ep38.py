# Episode 38 - Tu ne peux pas voir la 4e dimension (pourquoi, et comment l'apercevoir)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.4),
    ("say", "claude", [
        ("Longueur, largeur, hauteur : tu vis dans trois dimensions. Mais imagine une quatrième direction… que personne n'a jamais vue.",
         "Length, width, height: you live in three dimensions. But imagine a fourth direction… that no one has ever seen."),
    ], "serious"),
    ("cue", "title"),
    ("title", "TU NE PEUX PAS VOIR\\NLA 4E DIMENSION", "You can't see the 4th dimension", 2.8),
    ("pause", 2.6),

    ("scene", "construire"),
    ("say", "claude", [
        ("Construisons-la. Un point n'a aucune dimension. Fais-le glisser : tu obtiens une ligne, une dimension. Fais glisser la ligne sur le côté : un carré, deux dimensions. Soulève le carré : un cube, trois dimensions.",
         "Let's build it. A point has no dimension. Slide it: you get a line, one dimension. Slide the line sideways: a square, two dimensions. Lift the square: a cube, three dimensions."),
    ], "neutral"),
    ("cue", "tesseract"),
    ("say", "claude", [
        ("Et maintenant, fais glisser le cube dans une direction à angle droit avec les trois autres. Impossible à pointer du doigt… mais les mathématiques savent le faire. Tu obtiens un hypercube, qu'on appelle un tesseract.",
         "Now slide the cube in a direction at right angles to all three others. Impossible to point at… but mathematics can do it. You get a hypercube, called a tesseract."),
    ], "awe"),
    ("cue", "compte"),
    ("say", "claude", [
        ("Il a 16 sommets, 32 arêtes, 24 faces carrées… et 8 cubes en guise de faces.",
         "It has 16 corners, 32 edges, 24 square faces… and 8 cubes as its sides."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "temps"),
    ("say", "claude", [
        ("Attention, petite précision. En physique, on dit souvent que la quatrième dimension, c'est le temps : depuis Einstein et Minkowski, en 1908, on décrit l'univers comme un espace-temps. Mais ici, on parle d'autre chose : une quatrième direction de l'espace, dans laquelle on pourrait se déplacer.",
         "A quick clarification. In physics, people often say the fourth dimension is time: since Einstein and Minkowski, in 1908, the universe is described as spacetime. But here, we mean something else: a fourth direction of space, one you could move along."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "flatland"),
    ("date", "1884 · Flatland", "1884 · Flatland", 2.2),
    ("pause", 0.3),
    ("say", "claude", [
        ("Pour comprendre pourquoi on ne la voit pas, Edwin Abbott a imaginé en 1884 un monde tout plat, peuplé de formes en deux dimensions. Un carré y connaît la gauche, la droite, l'avant, l'arrière… mais « au-dessus », pour lui, ça ne veut rien dire.",
         "To understand why we can't see it, Edwin Abbott imagined in 1884 a completely flat world, filled with two-dimensional shapes. A square there knows left, right, forward, back… but \"above\" means nothing to him."),
    ], "neutral"),
    ("cue", "sphere"),
    ("say", "claude", [
        ("Un jour, une sphère traverse son monde. Le carré voit d'abord un point, puis un cercle qui grandit, rétrécit… et disparaît. Il ne verra jamais la sphère entière : seulement ses tranches.",
         "One day, a sphere passes through his world. The square first sees a dot, then a circle that grows, shrinks… and vanishes. He'll never see the whole sphere: only its slices."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "nous"),
    ("say", "claude", [
        ("Nous, nous sommes ce carré. Si une boule en quatre dimensions traversait ta chambre, tu verrais une sphère apparaître de nulle part, grossir, rétrécir… puis s'évanouir.",
         "We are that square. If a four-dimensional ball passed through your room, you'd see a sphere appear out of nowhere, grow, shrink… and vanish."),
    ], "serious"),
    ("cue", "cerveau"),
    ("say", "claude", [
        ("Et notre cerveau n'aide pas. Il s'est construit dans un monde en trois dimensions. Même nos yeux ne captent qu'une image plate : c'est le cerveau qui reconstruit la profondeur. Une direction en plus, il n'a tout simplement aucun moyen de se la représenter.",
         "And our brain doesn't help. It was built in a three-dimensional world. Even our eyes only capture a flat image: the brain rebuilds depth. One more direction, and it simply has no way to picture it."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "pouvoirs"),
    ("say", "claude", [
        ("Un être en quatre dimensions, lui, verrait l'intérieur de tout : d'un coffre-fort fermé, de ton sac… de ton corps. Il pourrait sortir un objet d'une boîte sans l'ouvrir.",
         "A four-dimensional being would see inside everything: a locked safe, your bag… your body. It could take an object out of a box without opening it."),
    ], "awe"),
    ("cue", "miroir"),
    ("say", "claude", [
        ("Et en te faisant passer par la quatrième dimension, il pourrait te retourner… comme ton reflet dans un miroir.",
         "And by taking you through the fourth dimension, it could flip you over… like your reflection in a mirror."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "ombres"),
    ("say", "claude", [
        ("Alors, comment l'apercevoir ? Comme le carré : par des ombres et des tranches. L'ombre d'un cube en fil de fer, sur une feuille, c'est un carré dans un carré. L'ombre d'un tesseract dans notre espace, c'est un cube dans un cube, qui semble se retourner sans fin.",
         "So how can we glimpse it? Like the square: through shadows and slices. The shadow of a wire cube on a sheet of paper is a square inside a square. The shadow of a tesseract in our space is a cube inside a cube, which seems to turn itself inside out forever."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "hinton"),
    ("say", "claude", [
        ("Au dix-neuvième siècle, le mathématicien Charles Hinton, qui a inventé le mot tesseract, entraînait son esprit avec des petits cubes colorés. Aujourd'hui, des jeux vidéo comme 4D Toys te font manipuler des objets en quatre dimensions… tranche par tranche.",
         "In the nineteenth century, the mathematician Charles Hinton, who coined the word tesseract, trained his mind with small coloured cubes. Today, video games like 4D Toys let you handle four-dimensional objects… slice by slice."),
    ], "happy"),
    ("cue", "dali"),
    ("say", "claude", [
        ("Et en 1954, Salvador Dalí a même peint le Christ sur un hypercube déplié.",
         "And in 1954, Salvador Dalí even painted Christ on an unfolded hypercube."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "physique"),
    ("say", "claude", [
        ("Et pour de vrai ? Certaines théories, comme la théorie des cordes, imaginent des dimensions en plus, mais enroulées sur elles-mêmes, minuscules. Comme un tuyau d'arrosage : de loin, une simple ligne. De près, un cercle autour. Pour l'instant, aucune expérience ne les a détectées.",
         "And in reality? Some theories, like string theory, imagine extra dimensions, but curled up and tiny. Like a garden hose: from afar, a simple line. Up close, a circle around it. So far, no experiment has detected them."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("Alors, si une quatrième dimension existe, elle est peut-être juste à côté de toi… dans une direction que tu ne peux pas montrer du doigt. Et toi, tu aimerais la voir ? Dis-le-moi en commentaire.",
         "So, if a fourth dimension exists, it might be right next to you… in a direction you can't point to. And you, would you like to see it? Tell me in the comments."),
    ], "happy"),
    ("pause", 1.6),
]
