# Episode 33 - Cet ange pleure de rage (L'Ange dechu, Alexandre Cabanel, 1847)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Regarde bien ses yeux. Une larme coule sur sa joue… et pourtant, ce n'est pas de la tristesse.",
         "Look closely at his eyes. A tear runs down his cheek… and yet, it isn't sadness."),
    ], "serious"),
    ("cue", "title"),
    ("title", "CET ANGE PLEURE DE RAGE", "This angel is crying with rage", 2.6),
    ("pause", 2.5),

    ("scene", "peintre"),
    ("say", "claude", [
        ("Ce tableau s'appelle « L'Ange déchu ». Alexandre Cabanel le peint en 1847, à Rome, où il étudie à la Villa Médicis. Il n'a pas encore 25 ans.",
         "This painting is called \"The Fallen Angel\". Alexandre Cabanel paints it in 1847, in Rome, where he's studying at the Villa Medici. He isn't even 25."),
    ], "neutral"),
    ("cue", "musee"),
    ("say", "claude", [
        ("Aujourd'hui, on peut le voir au musée Fabre de Montpellier, sa ville natale.",
         "Today, you can see it at the Musée Fabre in Montpellier, his home town."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "textes"),
    ("say", "claude", [
        ("Selon la tradition chrétienne, Lucifer était un ange de lumière. Par orgueil, il se révolte contre Dieu… et il est chassé du ciel.",
         "According to Christian tradition, Lucifer was an angel of light. Out of pride, he rebels against God… and is cast out of heaven."),
    ], "serious"),
    ("cue", "luc"),
    ("say", "claude", [
        ("Dans l'Évangile selon Saint Luc, Jésus dit : « Je voyais Satan tomber du ciel comme un éclair. »",
         "In the Gospel of Saint Luke, Jesus says: \"I saw Satan fall like lightning from heaven.\""),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "corps"),
    ("say", "claude", [
        ("Mais Cabanel ne peint pas un monstre. Pas de cornes, pas de griffes : un jeune homme d'une beauté parfaite, comme une statue antique.",
         "But Cabanel doesn't paint a monster. No horns, no claws: a young man of perfect beauty, like an ancient statue."),
    ], "neutral"),
    ("cue", "ailes"),
    ("say", "claude", [
        ("Seules ses grandes ailes sombres rappellent ce qu'il était.",
         "Only his great dark wings remind us of what he once was."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "visage"),
    ("say", "claude", [
        ("Son visage, lui, se cache derrière ses bras croisés. On ne voit que ses yeux, aux paupières rougies. Et une larme.",
         "His face hides behind his crossed arms. We only see his eyes, with reddened lids. And a tear."),
    ], "neutral"),
    ("cue", "regard"),
    ("say", "claude", [
        ("Mais ce regard nous fixe, droit dans les yeux, sourcils froncés. C'est une colère froide, retenue.",
         "But that gaze stares straight at us, brows furrowed. It's a cold, held-back anger."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "ciel"),
    ("say", "claude", [
        ("Derrière lui, dans le ciel, les anges restés fidèles s'éloignent, en pleine lumière. Lui reste en bas, seul, sur les rochers.",
         "Behind him, in the sky, the angels who stayed faithful drift away, in full light. He stays below, alone, on the rocks."),
    ], "neutral"),
    ("cue", "instant"),
    ("say", "claude", [
        ("Cabanel ne peint pas la chute. Il peint juste après : l'instant où l'ange comprend qu'il ne remontera jamais.",
         "Cabanel doesn't paint the fall. He paints just after: the moment the angel understands he will never go back up."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("Alors, pour toi : un ange qui pleure ce qu'il a perdu… ou le moment exact où naît le diable ?",
         "So, for you: an angel mourning what he has lost… or the exact moment the devil is born?"),
    ], "serious"),
    ("cue", "question"),
    ("say", "claude", [("Dis-le-moi en commentaire.", "Tell me in the comments.")], "neutral"),
    ("pause", 1.8),
]
