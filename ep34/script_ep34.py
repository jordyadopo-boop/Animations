# Episode 34 - Il a classe les anges sous un faux nom (les neuf choeurs, le Pseudo-Denys ; tableau de Botticini)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Regarde ce ciel : des centaines d'anges, rangés sur trois étages, en neuf rangées. Ce classement est partout dans l'art chrétien… mais la Bible ne le donne nulle part.",
         "Look at this sky: hundreds of angels, arranged on three tiers, in nine rows. This ranking is everywhere in Christian art… but the Bible never gives it."),
    ], "serious"),
    ("cue", "title"),
    ("title", "IL A CLASSÉ LES ANGES SOUS UN FAUX NOM", "He ranked the angels under a false name", 2.8),
    ("pause", 2.6),

    ("scene", "choeurs"),
    ("say", "claude", [
        ("Il y a d'abord les séraphins, les chérubins et les trônes. Puis les dominations, les vertus et les puissances. Enfin, les principautés, les archanges et les anges. Trois fois trois : les neuf chœurs.",
         "First the Seraphim, the Cherubim and the Thrones. Then the Dominions, the Virtues and the Powers. Finally, the Principalities, the Archangels and the Angels. Three times three: the nine choirs."),
    ], "neutral"),
    ("cue", "botticini"),
    ("say", "claude", [
        ("Le Florentin Francesco Botticini les peint vers 1475, autour de la Vierge et du Christ.",
         "The Florentine Francesco Botticini paints them around 1475, around the Virgin and Christ."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "livre"),
    ("say", "claude", [
        ("Ce classement vient d'un livre : « La Hiérarchie céleste ». Son auteur signe Denys, comme Denys l'Aréopagite, un Athénien converti par saint Paul dans les Actes des Apôtres.",
         "This ranking comes from a book: \"The Celestial Hierarchy\". Its author signs as Dionysius, like Dionysius the Areopagite, an Athenian converted by Saint Paul in the Acts of the Apostles."),
    ], "neutral"),
    ("cue", "temoin"),
    ("say", "claude", [("Presque un témoin des apôtres ! Son autorité devient immense.", "Almost a witness of the apostles! His authority becomes immense.")], "serious"),
    ("pause", 0.3),

    ("scene", "abbaye"),
    ("date", "827", "827", 2.4),
    ("pause", 0.3),
    ("say", "claude", [
        ("En 827, l'empereur byzantin offre ses écrits au roi des Francs, Louis le Pieux. Le manuscrit part à l'abbaye de Saint-Denis, près de Paris.",
         "In 827, the Byzantine emperor gives his writings to the king of the Franks, Louis the Pious. The manuscript goes to the abbey of Saint-Denis, near Paris."),
    ], "neutral"),
    ("cue", "hilduin"),
    ("say", "claude", [
        ("Et l'abbé Hilduine affirme que l'auteur est saint Denis lui-même, le martyr de Paris.",
         "And Abbot Hilduin claims the author is Saint Denis himself, the martyr of Paris."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "gothique"),
    ("say", "claude", [
        ("Au douzième siècle, l'abbé Suger reconstruit l'église de Saint-Denis et la remplit de lumière. On dit souvent qu'il s'inspire de Denys : la lumière qui élève l'âme vers Dieu.",
         "In the twelfth century, Abbot Suger rebuilds the church of Saint-Denis and fills it with light. It's often said he was inspired by Dionysius: light that lifts the soul to God."),
    ], "awe"),
    ("cue", "thomas"),
    ("say", "claude", [
        ("Plus tard, Thomas d'Aquin et Dante reprennent les neuf chœurs.",
         "Later, Thomas Aquinas and Dante take up the nine choirs."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "valla"),
    ("date", "1457 · Rome", "1457 · Rome", 2.2),
    ("pause", 0.3),
    ("say", "claude", [
        ("Mais en 1457, l'humaniste Lorenzo Valla a un doute : ce texte ne peut pas être celui d'un disciple de saint Paul.",
         "But in 1457, the humanist Lorenzo Valla has a doubt: this text can't be the work of a disciple of Saint Paul."),
    ], "serious"),
    ("cue", "an500"),
    ("say", "claude", [
        ("Aujourd'hui, on le date vers l'année 500, par un auteur inconnu nourri de philosophie grecque. On l'appelle le Pseudo-Denys.",
         "Today, it's dated to around the year 500, by an unknown author steeped in Greek philosophy. He's called Pseudo-Dionysius."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("Un faux nom… et pourtant, quinze siècles plus tard, on range toujours les anges comme lui. Est-ce que ça change quelque chose, pour toi ?",
         "A false name… and yet, fifteen centuries later, we still rank the angels his way. Does that change anything, for you?"),
    ], "serious"),
    ("cue", "question"),
    ("say", "claude", [("Dis-le-moi en commentaire.", "Tell me in the comments.")], "neutral"),
    ("pause", 1.8),
]
