# Episode 23 - Pourquoi les hommes sont-ils interesses par les grosses fesses ? (attirance, rapport taille-hanches, culture)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "cobaye": dict(voice="fr-FR-HenriNeural", rate="+4%", pitch="+0Hz"),
    "nadia": dict(voice="fr-BE-CharlineNeural", rate="+2%", pitch="+0Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.4),
    ("say", "claude", [
        ("Pourquoi tant d'hommes ont le regard attiré par les fesses ? Des chercheurs l'ont étudié très sérieusement… jusqu'à mesurer l'angle du dos.",
         "Why are so many men's eyes drawn to butts? Researchers have studied it very seriously… down to measuring the angle of the back."),
    ], "serious"),
    ("cue", "title"),
    ("title", "POURQUOI LES HOMMES SONT-ILS\\NINTÉRESSÉS PAR LES GROSSES FESSES ?", "Why are men drawn to big butts?", 3.0),
    ("pause", 2.9),

    ("scene", "venus"),
    ("date", "Il y a 29 500 ans · Autriche", "29,500 years ago · Austria", 2.6),
    ("pause", 0.4),
    ("say", "claude", [
        ("Il y a environ 29 500 ans, quelqu'un sculpte cette petite statuette : la Vénus de Willendorf. Des hanches et des fesses très larges.",
         "About 29,500 years ago, someone carves this small figurine: the Venus of Willendorf. Very wide hips and buttocks."),
    ], "neutral"),
    ("cue", "sens"),
    ("say", "claude", [
        ("Que représentait-elle ? La fertilité, une déesse, une vraie femme ? On ne sait pas : ce sont des hypothèses.",
         "What did she represent? Fertility, a goddess, a real woman? We don't know: these are hypotheses."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "singh"),
    ("say", "claude", [
        ("Dans les années 1990, le psychologue Devendra Singh montre des silhouettes à des hommes. Beaucoup préfèrent une taille nettement plus fine que les hanches.",
         "In the 1990s, psychologist Devendra Singh shows silhouettes to men. Many prefer a waist much narrower than the hips."),
    ], "neutral"),
    ("cue", "ratio"),
    ("say", "claude", [
        ("Ce qui compte, ce n'est pas seulement la taille des fesses : c'est le rapport entre le tour de taille et le tour de hanches. Environ 0,7.",
         "What matters isn't just the size of the butt: it's the ratio between waist and hips. About 0.7."),
    ], "happy"),
    ("cue", "pourquoi"),
    ("say", "claude", [
        ("Pourquoi ? Selon son hypothèse, ce rapport serait un signal de bonne santé et de fertilité, hérité de l'évolution. Une idée encore discutée.",
         "Why? According to his hypothesis, this ratio would be a signal of good health and fertility, inherited from evolution. An idea still debated."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "dos"),
    ("say", "claude", [
        ("En 2015, une équipe de l'université du Texas va plus loin : les hommes interrogés préfèrent une courbure du bas du dos d'environ 45 degrés.",
         "In 2015, a team at the University of Texas goes further: the men surveyed prefer a lower-back curve of about 45 degrees."),
    ], "neutral"),
    ("cue", "enceinte"),
    ("say", "claude", [
        ("Leur hypothèse : chez nos ancêtres, cette courbure aidait les femmes enceintes à garder l'équilibre… et les hommes auraient appris à la remarquer.",
         "Their hypothesis: in our ancestors, this curve helped pregnant women keep their balance… and men may have learned to notice it."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "regard"),
    ("say", "claude", [
        ("Et des caméras qui suivent le regard l'ont montré : les premiers coups d'œil vont souvent vers la taille et la poitrine, en une fraction de seconde.",
         "And eye-tracking cameras have shown it: the first glances often go to the waist and chest, in a split second."),
    ], "neutral"),
    ("cue", "cobaye"),
    ("say", "cobaye", [("Moi ? Je regardais le visage !", "Me? I was looking at the face!")], "joy"),
    ("cue", "reflexe"),
    ("say", "claude", [("C'est un réflexe très rapide, avant même de réfléchir.", "It's a very fast reflex, before we even think.")], "happy"),
    ("pause", 0.3),

    ("scene", "culture"),
    ("say", "claude", [
        ("Mais attention : ces goûts changent selon les cultures. Chez les Matsigenka du Pérou, une étude a trouvé une préférence pour des silhouettes plus rondes et plus droites. Et la mode change d'une époque à l'autre.",
         "But careful: these tastes vary between cultures. Among the Matsigenka of Peru, a study found a preference for rounder, straighter figures. And fashion changes from one era to the next."),
    ], "neutral"),
    ("cue", "respect"),
    ("say", "claude", [
        ("Et l'attirance ne se résume pas à un corps : la voix, l'humour, la gentillesse comptent aussi. Regarder, ce n'est pas fixer.",
         "And attraction isn't just about a body: voice, humour and kindness count too. Glancing isn't staring."),
    ], "neutral"),
    ("cue", "nadia"),
    ("say", "nadia", [("Mes yeux sont ici !", "My eyes are up here!")], "happy"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("Alors, pourquoi ? Un peu d'évolution, beaucoup de culture… et des hypothèses que la science discute encore.",
         "So, why? A bit of evolution, a lot of culture… and hypotheses that science is still debating."),
    ], "neutral"),
    ("cue", "question"),
    ("say", "claude", [("Et toi, qu'est-ce qui t'attire en premier chez quelqu'un ? Dis-le-moi en commentaire.", "And you, what attracts you first in someone? Tell me in the comments.")], "happy"),
    ("pause", 1.6),
]
