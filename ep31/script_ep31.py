# Episode 31 - Machiavel, l'homme qui a ecrit le manuel du pouvoir
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "machiavel": dict(voice="fr-FR-HenriNeural", rate="-4%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.4),
    ("say", "claude", [
        ("« Il vaut mieux être craint qu'aimé. » Cette phrase a donné son nom à un adjectif qui fait peur : machiavélique. Mais l'homme qui l'a écrite était-il vraiment un monstre ?",
         "\"It is better to be feared than loved.\" This sentence gave its name to a frightening word: Machiavellian. But was the man who wrote it really a monster?"),
    ], "serious"),
    ("cue", "title"),
    ("title", "MACHIAVEL, LE MANUEL DU POUVOIR", "Machiavelli, the handbook of power", 2.8),
    ("pause", 2.7),

    ("scene", "florence"),
    ("date", "1469 · Florence", "1469 · Florence", 2.4),
    ("pause", 0.3),
    ("say", "claude", [
        ("Nicolas Machiavel naît à Florence, dans une famille sans grande fortune. L'Italie est alors découpée en petits États rivaux, et les armées de France et d'Espagne viennent s'y battre.",
         "Niccolò Machiavelli is born in Florence, into a family without much money. Italy is then split into small rival states, and the armies of France and Spain come to fight there."),
    ], "neutral"),
    ("cue", "secretaire"),
    ("say", "claude", [
        ("À 29 ans, il devient secrétaire de la République de Florence. Il part en mission chez le roi de France, Louis XII, et observe de près comment les puissants gardent le pouvoir.",
         "At 29, he becomes secretary of the Republic of Florence. He goes on missions to the King of France, Louis XII, and watches up close how the powerful keep power."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "borgia"),
    ("say", "claude", [
        ("En 1502, on l'envoie auprès de César Borgia, le fils du pape. Un chef audacieux, rapide, qui mêle la ruse et la peur. Machiavel est fasciné : il en fera un modèle dans son livre.",
         "In 1502, he is sent to Cesare Borgia, the pope's son. A bold, fast leader who mixes cunning and fear. Machiavelli is fascinated: he will make him a model in his book."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "chute"),
    ("date", "1512 – 1513 · Florence", "1512 – 1513 · Florence", 2.4),
    ("pause", 0.3),
    ("say", "claude", [
        ("Mais en 1512, la famille Médicis reprend Florence, et la République tombe. Machiavel perd son poste. Quelques mois plus tard, on le soupçonne d'un complot : il est arrêté et torturé.",
         "But in 1512, the Medici family retakes Florence, and the Republic falls. Machiavelli loses his job. A few months later, he is suspected of a plot: he is arrested and tortured."),
    ], "serious"),
    ("cue", "libere"),
    ("say", "claude", [
        ("Il n'avoue rien. Libéré grâce à une amnistie, il se retire dans sa petite ferme, près de Florence.",
         "He confesses nothing. Freed thanks to an amnesty, he withdraws to his small farm near Florence."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "lettre"),
    ("say", "claude", [
        ("Là, il écrit à un ami une lettre restée célèbre.", "There, he writes a friend a letter that became famous."),
    ], "neutral"),
    ("cue", "mach_dit"),
    ("say", "machiavel", [
        ("Le soir venu, j'entre dans mon cabinet. J'ôte mes habits du jour, couverts de boue, et je revêts des habits de cour. Alors, je converse avec les hommes de l'Antiquité.",
         "When evening comes, I go into my study. I take off my day clothes, covered in mud, and put on courtly robes. Then I converse with the men of antiquity."),
    ], "serious"),
    ("cue", "prince"),
    ("say", "claude", [
        ("C'est ainsi qu'il compose, en 1513, un petit livre : Le Prince. Il le dédie à un Médicis… en espérant retrouver un travail.",
         "That's how, in 1513, he writes a small book: The Prince. He dedicates it to a Medici… hoping to get a job back."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "idees"),
    ("say", "claude", [
        ("Dedans, des idées froides : un chef doit être renard pour voir les pièges, et lion pour effrayer les loups.",
         "Inside, cold ideas: a leader must be a fox to see the traps, and a lion to frighten the wolves."),
    ], "neutral"),
    ("cue", "craint"),
    ("say", "claude", [
        ("Il vaut mieux être craint qu'aimé, si l'on ne peut pas être les deux… mais il faut surtout éviter d'être haï. Et « la fin justifie les moyens » ? Il n'a jamais écrit cette phrase.",
         "It is better to be feared than loved, if you can't be both… but above all, you must avoid being hated. And \"the end justifies the means\"? He never wrote that sentence."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "posterite"),
    ("say", "claude", [
        ("Le Prince n'est publié qu'en 1532, cinq ans après sa mort. L'Église l'interdit, et son nom devient synonyme de manipulation. Pourtant, dans un autre livre, Machiavel défend les républiques et la liberté.",
         "The Prince is only published in 1532, five years after his death. The Church bans it, and his name becomes a byword for manipulation. And yet, in another book, Machiavelli defends republics and freedom."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("Et toi, pour un chef, il vaut mieux être craint… ou être aimé ? Dis-le-moi en commentaire.",
         "And you, for a leader, is it better to be feared… or loved? Tell me in the comments."),
    ], "happy"),
    ("pause", 1.6),
]
