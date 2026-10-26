# Episode 20 - Ton cerveau croit ce que tu repetes ? (verite illusoire, neurones, apprendre, mythe des 10 %)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "sami": dict(voice="fr-CA-AntoineNeural", rate="-2%", pitch="+0Hz"),
    "lea": dict(voice="fr-BE-CharlineNeural", rate="+4%", pitch="+0Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("La Grande Muraille de Chine se voit depuis l'espace.", "The Great Wall of China can be seen from space."),
    ], "neutral"),
    ("cue", "false"),
    ("say", "claude", [
        ("Tu l'as entendu cent fois… et c'est faux. Les astronautes ne la voient pas à l'œil nu. Alors pourquoi on y croit ?",
         "You've heard it a hundred times… and it's false. Astronauts can't see it with the naked eye. So why do we believe it?"),
    ], "serious"),
    ("cue", "title"),
    ("title", "TON CERVEAU CROIT CE QUE TU RÉPÈTES ?", "Does your brain believe what you repeat?", 2.6),
    ("pause", 2.5),

    ("scene", "labo"),
    ("say", "claude", [
        ("En 1977, des psychologues américains font une expérience : ils montrent des phrases à des étudiants, plusieurs fois, à deux semaines d'intervalle.",
         "In 1977, American psychologists run an experiment: they show statements to students, several times, two weeks apart."),
        ("Résultat : les phrases répétées sont jugées plus vraies… même quand elles sont fausses.", "Result: the repeated statements are judged truer… even when they are false."),
    ], "neutral"),
    ("cue", "effet"),
    ("say", "claude", [
        ("On appelle ça l'effet de vérité illusoire. Et en 2015, une étude a montré qu'il marche même quand on connaît la bonne réponse.",
         "It's called the illusory truth effect. And in 2015, a study showed it works even when we know the right answer."),
    ], "neutral"),
    ("cue", "facile"),
    ("say", "claude", [
        ("Pourquoi ? Parce qu'une phrase familière est plus facile à lire pour le cerveau… et ce qui est facile nous paraît vrai.",
         "Why? Because a familiar sentence is easier for the brain to process… and what's easy feels true."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "neurones"),
    ("say", "claude", [
        ("Ton cerveau contient environ 86 milliards de neurones. Ils se parlent par de petites décharges électriques et chimiques, à travers des connexions qu'on appelle les synapses.",
         "Your brain contains about 86 billion neurons. They talk through tiny electrical and chemical signals, across connections called synapses."),
    ], "neutral"),
    ("cue", "hebb"),
    ("say", "claude", [
        ("En 1949, le psychologue Donald Hebb a proposé une idée devenue célèbre : quand deux neurones s'activent ensemble, encore et encore, leur connexion se renforce.",
         "In 1949, psychologist Donald Hebb proposed a famous idea: when two neurons fire together, again and again, their connection gets stronger."),
    ], "neutral"),
    ("cue", "chemin"),
    ("say", "claude", [
        ("C'est comme un chemin dans l'herbe : plus on y passe, plus il est facile à prendre. Une pensée répétée devient un chemin rapide… qu'elle soit vraie ou fausse.",
         "It's like a path in the grass: the more you walk it, the easier it gets. A repeated thought becomes a fast path… whether it's true or false."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "sami"),
    ("say", "sami", [("Je suis nul en maths. De toute façon, j'ai toujours été nul.", "I'm bad at maths. Anyway, I've always been bad.")], "sad"),
    ("cue", "soi"),
    ("say", "claude", [("C'est pareil pour les phrases qu'on se répète sur soi. À force, elles semblent évidentes.", "It's the same with what we keep telling ourselves. Over time, it seems obvious.")], "neutral"),
    ("cue", "etude"),
    ("say", "claude", [
        ("Mais attention : se répéter le contraire ne suffit pas toujours. En 2009, une étude a montré que répéter « je suis quelqu'un d'aimable » pouvait même faire se sentir plus mal les personnes qui avaient une faible estime d'elles-mêmes.",
         "But careful: repeating the opposite isn't always enough. In 2009, a study showed that repeating \"I'm a lovable person\" could even make people with low self-esteem feel worse."),
    ], "neutral"),
    ("cue", "verifier"),
    ("say", "claude", [
        ("Ce qui aide davantage, selon les psychologues : remarquer la pensée, et la vérifier. « Nul en maths… vraiment ? Et l'exercice que j'ai réussi hier ? »",
         "What helps more, according to psychologists: notice the thought, and check it. \"Bad at maths… really? What about the exercise I got right yesterday?\""),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "apprendre"),
    ("say", "claude", [
        ("La bonne nouvelle, c'est que ces chemins dans le cerveau peuvent aussi se créer pour le meilleur : chaque fois qu'on apprend quelque chose de nouveau.",
         "The good news is that these paths in the brain can also be built for the better: every time we learn something new."),
    ], "happy"),
    ("cue", "taxi"),
    ("say", "claude", [
        ("À Londres, les chauffeurs de taxi doivent apprendre par cœur des milliers de rues. En 2000, des chercheurs ont observé chez eux une zone de la mémoire de l'espace plus développée… et d'autant plus que leur carrière était longue.",
         "In London, taxi drivers must learn thousands of streets by heart. In 2000, researchers found a more developed spatial memory area in their brains… the more so the longer their career."),
    ], "neutral"),
    ("cue", "lea"),
    ("say", "lea", [("Trois balles… allez, encore une fois !", "Three balls… come on, one more time!")], "joy"),
    ("cue", "jongle"),
    ("say", "claude", [
        ("Et en 2004, des volontaires ont appris à jongler pendant trois mois. Leur cerveau a changé dans les zones qui suivent les mouvements. Quand ils ont arrêté, une partie du changement a disparu.",
         "And in 2004, volunteers learned to juggle for three months. Their brains changed in the areas that track movement. When they stopped, part of the change faded."),
    ], "neutral"),
    ("cue", "muscle"),
    ("say", "claude", [
        ("Le cerveau, c'est comme un muscle : il se garde en forme en apprenant. Une langue, un instrument, une recette, un nouveau chemin…",
         "The brain is like a muscle: it stays fit by learning. A language, an instrument, a recipe, a new route…"),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "mythe"),
    ("say", "claude", [("Et cette phrase qu'on entend partout : « on n'utilise que 10 % de notre cerveau » ? C'est faux.", "And that sentence we hear everywhere: \"we only use 10% of our brain\"? It's false.")], "serious"),
    ("cue", "imagerie"),
    ("say", "claude", [
        ("Les images du cerveau montrent qu'au cours d'une journée, presque toutes ses zones travaillent, chacune à son tour. Même quand tu dors !",
         "Brain scans show that over a day, almost all its areas are at work, each in turn. Even while you sleep!"),
    ], "happy"),
    ("cue", "epilepsie"),
    ("say", "claude", [
        ("Mais pas toutes en même temps : si tous tes neurones s'activaient d'un coup, ce ne serait pas du génie… ça ressemblerait plutôt à une crise d'épilepsie.",
         "But not all at once: if all your neurons fired at the same time, it wouldn't be genius… it would look more like an epileptic seizure."),
    ], "neutral"),
    ("cue", "james"),
    ("say", "claude", [
        ("Le mythe viendrait d'une phrase mal comprise d'un psychologue américain du début du vingtième siècle, William James, qui parlait de notre « potentiel inutilisé ». Le chiffre de 10 % a été ajouté plus tard.",
         "The myth may come from a misread line by an early twentieth-century American psychologist, William James, who spoke of our \"unused potential\". The 10% figure was added later."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("Alors, ton cerveau croit-il tout ce que tu répètes ? Pas tout à fait. Il renforce ce que tu répètes, et il grandit avec ce que tu apprends. Choisis bien ce que tu lui donnes à répéter.",
         "So, does your brain believe everything you repeat? Not quite. It strengthens what you repeat, and it grows with what you learn. Choose carefully what you give it to repeat."),
    ], "happy"),
    ("cue", "question"),
    ("say", "claude", [("Et toi, qu'est-ce que tu aimerais apprendre cette année ? Dis-le-moi en commentaire.", "And you, what would you like to learn this year? Tell me in the comments.")], "happy"),
    ("pause", 1.6),
]
