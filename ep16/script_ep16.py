# Episode 16 - Il ne crie pas (Le Cri d'Edvard Munch)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "munch": dict(voice="fr-FR-HenriNeural", rate="-8%", pitch="-6Hz"),
    "scharff": dict(voice="fr-CA-AntoineNeural", rate="-6%", pitch="+0Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Ce matin, des millions de gens ont cette tête-là.", "This morning, millions of people have this face."),
    ], "neutral"),
    ("cue", "ears"),
    ("say", "claude", [
        ("Mais regarde bien : il se bouche les oreilles. Et ce n'est pas un hasard.", "But look closely: he's covering his ears. And that's no accident."),
    ], "serious"),
    ("cue", "title"),
    ("title", "IL NE CRIE PAS", "He is not screaming", 2.4),
    ("pause", 2.3),
    ("say", "claude", [
        ("Le Cri, d'Edvard Munch. L'un des tableaux les plus célèbres du monde… et presque tout le monde se trompe sur lui.",
         "The Scream, by Edvard Munch. One of the most famous paintings in the world… and almost everyone gets it wrong."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "ekeberg"),
    ("date", "Kristiania (aujourd'hui Oslo), vers 1892", "Kristiania (now Oslo), around 1892", 3.0),
    ("pause", 0.6),
    ("say", "claude", [
        ("Un soir, Munch se promène avec deux amis. Il a raconté ce moment dans son journal.", "One evening, Munch goes for a walk with two friends. He described the moment in his diary."),
    ], "neutral"),
    ("cue", "diary"),
    ("say", "munch", [
        ("Le ciel est soudain devenu rouge sang.", "Suddenly the sky turned blood red."),
        ("Mes amis ont continué… et j'ai senti un cri immense traverser la nature.", "My friends walked on… and I felt a vast scream passing through nature."),
    ], "fear"),
    ("cue", "cover"),
    ("pause", 0.3),
    ("say", "claude", [
        ("Le cri ne sort pas de sa bouche : il vient de partout. Lui, il se bouche les oreilles pour ne plus l'entendre.",
         "The scream doesn't come from his mouth: it comes from everywhere. He covers his ears to stop hearing it."),
        ("D'ailleurs, Munch l'a d'abord appelé : Le Cri de la nature.", "In fact, Munch first called it: The Scream of Nature."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "tableau"),
    ("say", "claude", [
        ("Regarde le visage : pas de cheveux, pas de nez. Presque un crâne.", "Look at the face: no hair, no nose. Almost a skull."),
    ], "serious"),
    ("cue", "friends"),
    ("say", "claude", [
        ("Derrière lui, ses deux amis continuent leur route. Ils n'entendent rien. Il est seul.", "Behind him, his two friends keep walking. They hear nothing. He is alone."),
    ], "serious"),
    ("cue", "sky"),
    ("say", "claude", [
        ("Et ce ciel ? Pour certains, ce sont les couchers de soleil rouges après l'éruption d'un volcan. Pour d'autres, des nuages rares.",
         "And that sky? Some say it's the red sunsets after a volcanic eruption. Others, rare clouds."),
        ("Ou simplement l'angoisse de Munch. Personne ne sait.", "Or simply Munch's anxiety. Nobody knows."),
    ], "neutral"),
    ("cue", "angels"),
    ("say", "claude", [
        ("Quand il était enfant, il a perdu sa mère, puis sa sœur, toutes deux de la tuberculose.", "As a child, he lost his mother, then his sister, both to tuberculosis."),
        ("Il a écrit : « La maladie, la folie et la mort étaient les anges noirs qui veillaient sur mon berceau. »",
         "He wrote: \"Illness, insanity and death were the black angels that watched over my cradle.\""),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "secret"),
    ("say", "claude", [
        ("Mais le plus troublant est caché.", "But the most unsettling part is hidden."),
    ], "serious"),
    ("cue", "corner"),
    ("say", "claude", [
        ("Là, en haut à gauche, une phrase écrite au crayon :", "There, top left, a sentence in pencil:"),
    ], "serious"),
    ("cue", "reveal"),
    ("say", "claude", [
        ("« Ne peut avoir été peint que par un fou. »", "\"Can only have been painted by a madman.\""),
    ], "fear"),
    ("pause", 0.5),
    ("cue", "museum"),
    ("say", "claude", [
        ("Pendant longtemps, on a cru à un vandale. En 2021, le Musée national de Norvège l'a étudiée à l'infrarouge : c'est l'écriture de Munch lui-même.",
         "For a long time, people thought it was a vandal. In 2021, Norway's National Museum studied it with infrared: it's Munch's own handwriting."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "debat"),
    ("date", "Kristiania, 1895", "Kristiania, 1895", 2.6),
    ("pause", 0.5),
    ("say", "claude", [
        ("En 1895, Munch expose le tableau dans son pays. Lors d'une soirée-débat, un jeune étudiant en médecine, Johan Scharffenberg, met en doute sa santé mentale.",
         "In 1895, Munch shows the painting at home. At a public debate, a young medical student, Johan Scharffenberg, questions his sanity."),
    ], "neutral"),
    ("cue", "stand"),
    ("say", "scharff", [
        ("Celui qui peint de telles choses n'est pas sain d'esprit !", "Whoever paints such things is not of sound mind!"),
    ], "angry"),
    ("cue", "hurt"),
    ("pause", 0.4),
    ("say", "claude", [
        ("Le musée pense que Munch, blessé, a écrit cette phrase peu après. Une blague amère… ou un aveu.",
         "The museum believes Munch, hurt, wrote that sentence soon after. A bitter joke… or a confession."),
    ], "serious"),
    ("pause", 0.4),

    ("scene", "outro"),
    ("say", "claude", [
        ("Alors, si tu as cette tête-là ce lundi… souviens-toi : il ne crie pas. Il essaie de ne plus entendre.",
         "So if you've got that face this Monday… remember: he isn't screaming. He's trying not to hear."),
    ], "neutral"),
    ("cue", "question"),
    ("say", "claude", [
        ("Et toi… tu l'as déjà entendu, ce cri ? Dis-le-moi en commentaire.", "And you… have you ever heard that scream? Tell me in the comments."),
    ], "happy"),
    ("pause", 1.6),
]
