# Episode 21 - Le livre que personne ne sait lire (manuscrit de Voynich, Beinecke MS 408)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voynich": dict(voice="fr-FR-HenriNeural", rate="+0%", pitch="-2Hz"),
    "chercheuse": dict(voice="fr-FR-DeniseNeural", rate="+2%", pitch="+0Hz"),
    "friedman": dict(voice="fr-CA-AntoineNeural", rate="-4%", pitch="-3Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.4),
    ("say", "claude", [
        ("Un livre de 600 ans, rempli de plantes qui n'existent pas, dans une langue que personne ne sait lire. Même pas l'IA.",
         "A 600-year-old book, full of plants that don't exist, in a language no one can read. Not even AI."),
    ], "serious"),
    ("cue", "aveu"),
    ("say", "claude", [("Et moi non plus, j'avoue. Pourtant, j'ai essayé.", "Me neither, I admit. And yet, I tried.")], "happy"),
    ("cue", "title"),
    ("title", "LE LIVRE QUE PERSONNE NE SAIT LIRE", "The book no one can read", 2.6),
    ("pause", 2.5),

    ("scene", "villa"),
    ("date", "1912 · Villa Mondragone, près de Rome", "1912 · Villa Mondragone, near Rome", 2.8),
    ("pause", 0.6),
    ("say", "claude", [
        ("En 1912, un libraire d'origine polonaise, Wilfrid Voïnitch, achète de vieux manuscrits à des pères jésuites, près de Rome. Parmi eux, un petit livre en parchemin.",
         "In 1912, a Polish-born bookseller, Wilfrid Voynich, buys old manuscripts from Jesuit fathers near Rome. Among them, a small parchment book."),
    ], "neutral"),
    ("cue", "voynich"),
    ("say", "voynich", [("Quelle est cette écriture ? Je n'ai jamais vu ça.", "What is this script? I've never seen anything like it.")], "awe"),
    ("cue", "yale"),
    ("say", "claude", [
        ("Aujourd'hui, il porte son nom : le manuscrit de Voïnitch. Il est conservé à l'université Yale, aux États-Unis, sous la cote MS 408.",
         "Today it bears his name: the Voynich manuscript. It is kept at Yale University, in the United States, as MS 408."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "pages"),
    ("say", "claude", [
        ("Environ 240 pages. Des plantes dessinées avec soin… mais presque aucune n'a pu être identifiée.",
         "About 240 pages. Carefully drawn plants… yet almost none have been identified."),
    ], "neutral"),
    ("cue", "etoiles"),
    ("say", "claude", [
        ("Des cercles d'étoiles, des signes du zodiaque, des bassins reliés par d'étranges tuyaux.",
         "Star circles, zodiac signs, pools linked by strange pipes."),
    ], "neutral"),
    ("cue", "ecriture"),
    ("say", "claude", [
        ("Et partout, la même écriture : environ 38 000 mots, dans un alphabet qu'on ne retrouve nulle part ailleurs.",
         "And everywhere, the same script: about 38,000 words, in an alphabet found nowhere else."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "labo"),
    ("date", "2009 · Université d'Arizona", "2009 · University of Arizona", 2.6),
    ("pause", 0.5),
    ("say", "claude", [
        ("Longtemps, on a soupçonné un faux fabriqué par Voïnitch lui-même. Alors, en 2009, des chercheurs de l'université d'Arizona prélèvent quatre minuscules morceaux de pages.",
         "For a long time, people suspected a fake made by Voynich himself. So in 2009, researchers at the University of Arizona take four tiny samples from its pages."),
    ], "neutral"),
    ("cue", "chercheuse"),
    ("say", "chercheuse", [("Carbone quatorze : la peau a été préparée entre 1404 et 1438.", "Carbon-14: the skin was prepared between 1404 and 1438.")], "serious"),
    ("cue", "peau"),
    ("say", "claude", [
        ("Le parchemin a donc près de 600 ans. Attention : on date la peau, pas l'encre. Mais la plupart des experts pensent que le texte a été écrit peu après.",
         "So the parchment is nearly 600 years old. Careful: we're dating the skin, not the ink. But most experts think the text was written soon after."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "copiste"),
    ("say", "claude", [
        ("Qui l'a écrit ? On ne sait pas. Une spécialiste, Lisa Fagin Davis, pense y reconnaître la main de cinq copistes différents.",
         "Who wrote it? We don't know. A specialist, Lisa Fagin Davis, thinks she can see the hands of five different scribes."),
    ], "neutral"),
    ("cue", "prague"),
    ("say", "claude", [
        ("Au dix-septième siècle, le livre est à Prague. Une lettre des années 1660 rapporte une rumeur : l'empereur Rodolphe Deux l'aurait acheté 600 ducats. Rien ne le prouve.",
         "In the seventeenth century, the book is in Prague. A letter from the 1660s reports a rumour: Emperor Rudolf II supposedly bought it for 600 ducats. Nothing proves it."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "codes"),
    ("say", "claude", [
        ("Dans les années 1940 et 1950, William Friedman, l'un des plus grands casseurs de codes américains, s'y attaque avec ses équipes. Échec.",
         "In the 1940s and 1950s, William Friedman, one of America's greatest codebreakers, takes it on with his teams. Failure."),
    ], "serious"),
    ("cue", "friedman"),
    ("say", "friedman", [("Ce n'est pas un code comme les autres.", "This is not a code like the others.")], "serious"),
    ("cue", "ia"),
    ("say", "claude", [
        ("En 2018, des chercheurs canadiens utilisent un programme d'intelligence artificielle. Il penche pour de l'hébreu… mais la phrase obtenue ne veut pas dire grand-chose, et les spécialistes ne sont pas convaincus.",
         "In 2018, Canadian researchers use an artificial intelligence program. It leans towards Hebrew… but the resulting sentence barely makes sense, and specialists aren't convinced."),
    ], "neutral"),
    ("cue", "moi"),
    ("say", "claude", [
        ("Et moi ? Je vois des mots qui reviennent, des débuts et des fins qui se répètent… Mais lire ? Non. Pour une fois, je sèche.",
         "And me? I see words that come back, beginnings and endings that repeat… But read it? No. For once, I'm stumped."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "hypo"),
    ("say", "claude", [
        ("Alors, que cache-t-il ? Ce ne sont que des hypothèses : une vraie langue écrite avec un alphabet inventé… un code secret… ou un canular très savant, rempli de faux mots.",
         "So what does it hide? These are only hypotheses: a real language written in an invented alphabet… a secret code… or a very clever hoax, full of fake words."),
    ], "neutral"),
    ("cue", "indice"),
    ("say", "claude", [
        ("Un indice trouble les chercheurs : ses mots reviennent avec les mêmes fréquences que dans nos vraies langues. Du charabia en serait-il capable ? Le débat continue.",
         "One clue puzzles researchers: its words recur with the same frequencies as in our real languages. Could gibberish do that? The debate goes on."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("Six siècles plus tard, le livre garde son secret. Il est même entièrement en ligne : tout le monde peut essayer.",
         "Six centuries later, the book keeps its secret. It's even entirely online: anyone can try."),
    ], "neutral"),
    ("cue", "question"),
    ("say", "claude", [("Et toi, tu penses que c'est quoi : une langue perdue, un code, ou un canular génial ? Dis-le-moi en commentaire.",
                        "And you, what do you think it is: a lost language, a code, or a brilliant hoax? Tell me in the comments.")], "happy"),
    ("pause", 1.6),
]
