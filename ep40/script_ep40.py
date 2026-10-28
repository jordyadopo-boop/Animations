# Episode 40 - L'ange qui refusa d'etre adore (Apocalypse 22, 6-15) - on remonte la Bible scene par scene
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
    "ange": dict(voice="fr-CH-FabriceNeural", rate="-4%", pitch="-2Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Un homme se jette aux pieds d'un ange pour l'adorer… et l'ange l'arrête aussitôt. Le plus étrange ? Ce n'est pas la première fois.",
         "A man throws himself at an angel's feet to worship him… and the angel stops him at once. The strangest part? It isn't the first time."),
    ], "serious"),
    ("cue", "serie"),
    ("say", "claude", [
        ("On remonte la Bible, scène par scène. La dernière fois, on a entendu ses toutes dernières paroles. Aujourd'hui, on recule d'une scène.",
         "We're going back through the Bible, scene by scene. Last time, we heard its very last words. Today, we go back one scene."),
    ], "happy"),
    ("cue", "title"),
    ("title", "L'ANGE QUI REFUSA\\ND'ÊTRE ADORÉ", "The angel who refused to be worshipped", 2.8),
    ("pause", 2.6),

    ("scene", "certain"),
    ("say", "claude", [
        ("Sur l'île de Patmos, la grande vision de Jean se termine. Un ange, celui qui lui a tout montré, se tient devant lui et lui dit :",
         "On the island of Patmos, John's great vision is ending. An angel, the one who showed him everything, stands before him and says:"),
    ], "neutral"),
    ("say", "ange", [
        ("« Ces paroles sont certaines et véritables. Le Seigneur a envoyé son ange pour montrer à ses serviteurs les choses qui doivent arriver bientôt. »",
         "\"These sayings are faithful and true: and the Lord sent his angel to shew unto his servants the things which must shortly be done.\""),
    ], "serious"),
    ("cue", "heureux"),
    ("say", "voix", [
        ("« Et voici, je viens bientôt. Heureux celui qui garde les paroles de la prophétie de ce livre ! »",
         "\"Behold, I come quickly: blessed is he that keepeth the sayings of the prophecy of this book.\""),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "genoux"),
    ("say", "claude", [
        ("Bouleversé, Jean raconte : « Quand j'eus entendu et vu, je tombai aux pieds de l'ange qui me les montrait, pour l'adorer. » Mais l'ange réagit immédiatement :",
         "Overwhelmed, John says: \"When I had heard and seen, I fell down to worship before the feet of the angel which shewed me these things.\" But the angel reacts immediately:"),
    ], "serious"),
    ("say", "ange", [
        ("« Garde-toi de le faire ! Je suis ton compagnon de service, et celui de tes frères les prophètes. Adore Dieu. »",
         "\"See thou do it not: for I am thy fellowservant, and of thy brethren the prophets. Worship God.\""),
    ], "serious"),
    ("cue", "deuxfois"),
    ("say", "claude", [
        ("Pour l'ange, il n'est qu'un serviteur, comme Jean. Et le détail troublant : Jean avait déjà fait exactement la même chose, trois chapitres plus tôt… et l'ange lui avait déjà répondu presque mot pour mot.",
         "To the angel, he's only a servant, like John. And the troubling detail: John had already done exactly the same thing, three chapters earlier… and the angel had already answered almost word for word."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "sceau"),
    ("say", "ange", [
        ("« Ne scelle point les paroles de la prophétie de ce livre. Car le temps est proche. »",
         "\"Seal not the sayings of the prophecy of this book: for the time is at hand.\""),
    ], "serious"),
    ("cue", "daniel"),
    ("say", "claude", [
        ("Sceller un livre, c'est le fermer avec de la cire, pour qu'on ne le lise pas avant l'heure. Des siècles plus tôt, on avait ordonné l'inverse au prophète Daniel : « Tiens secrètes ces paroles, et scelle le livre, jusqu'au temps de la fin. » Ici, le message est clair : le moment est venu de l'ouvrir.",
         "To seal a book is to close it with wax, so no one reads it before its time. Centuries earlier, the prophet Daniel had been told the opposite: \"Shut up the words, and seal the book, even to the time of the end.\" Here, the message is clear: the time has come to open it."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "alpha"),
    ("say", "voix", [
        ("« Voici, je viens bientôt, et ma rétribution est avec moi, pour rendre à chacun selon son œuvre. Je suis l'alpha et l'oméga, le premier et le dernier, le commencement et la fin. »",
         "\"Behold, I come quickly; and my reward is with me, to give every man according as his work shall be. I am Alpha and Omega, the beginning and the end, the first and the last.\""),
    ], "serious"),
    ("cue", "lettres"),
    ("say", "claude", [
        ("Alpha et oméga, ce sont la première et la dernière lettre de l'alphabet grec, la langue dans laquelle l'Apocalypse a été écrite. Une façon de dire : du début à la fin de toute l'histoire, c'est moi.",
         "Alpha and omega are the first and last letters of the Greek alphabet, the language Revelation was written in. A way of saying: from the beginning to the end of the whole story, it's me."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "robes"),
    ("say", "voix", [
        ("« Heureux ceux qui lavent leurs robes, afin d'avoir droit à l'arbre de vie, et d'entrer par les portes dans la ville ! »",
         "\"Blessed are they that do his commandments, that they may have right to the tree of life, and may enter in through the gates into the city.\""),
    ], "happy"),
    ("cue", "dehors"),
    ("say", "claude", [
        ("Laver sa robe, dans l'Apocalypse, c'est l'image d'une vie purifiée. Et ceux qui refusent restent dehors : le texte cite les meurtriers, les menteurs, les idolâtres… et les « chiens », une insulte de l'époque pour les gens jugés impurs.",
         "Washing one's robe, in Revelation, is the image of a purified life. And those who refuse stay outside: the text lists murderers, liars, idolaters… and \"dogs\", an insult of the time for people considered impure."),
    ], "serious"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, l'ange montre à Jean un fleuve aussi limpide que le cristal… et sur ses deux rives, un arbre qu'on n'avait plus revu depuis la toute première page de la Bible. Ce sera le prochain épisode.",
         "But this story follows another one. Just before, the angel shows John a river as clear as crystal… and on both its banks, a tree no one had seen since the very first page of the Bible. That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
