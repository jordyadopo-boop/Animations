# Episode 15 - Pourquoi on deteste le lundi ? (les jours de la semaine)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "marc": dict(voice="fr-CH-FabriceNeural", rate="+0%", pitch="-4Hz"),
    "ines": dict(voice="fr-FR-EloiseNeural", rate="+4%", pitch="+0Hz"),
    "aicha": dict(voice="fr-CH-ArianeNeural", rate="+0%", pitch="+0Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.6),
    ("say", "claude", [
        ("Chaque lundi matin, des millions de personnes pensent la même chose : « Déjà ? »", "Every Monday morning, millions of people think the same thing: \"Already?\""),
        ("Mais d'où vient la semaine… et pourquoi le lundi a-t-il si mauvaise réputation ?", "But where does the week come from… and why does Monday have such a bad reputation?"),
    ], "happy"),
    ("cue", "title"),
    ("title", "POURQUOI ON DÉTESTE LE LUNDI ?", "Why do we hate Mondays?", 2.6),
    ("pause", 2.3),

    ("scene", "genesis"),
    ("say", "claude", [
        ("Selon le livre de la Genèse, au début de la Bible, Dieu crée le monde en six jours.", "According to the Book of Genesis, at the start of the Bible, God creates the world in six days."),
    ], "neutral"),
    ("cue", "days"),
    ("say", "claude", [
        ("Le premier jour, la lumière. Le deuxième, le ciel. Le troisième, la terre, les mers et les plantes.", "The first day, light. The second, the sky. The third, the land, the seas and the plants."),
        ("Le quatrième, le soleil, la lune et les étoiles. Le cinquième, les poissons et les oiseaux. Le sixième, les animaux… et l'homme.", "The fourth, the sun, the moon and the stars. The fifth, fish and birds. The sixth, animals… and mankind."),
    ], "happy"),
    ("cue", "rest"),
    ("say", "claude", [
        ("Et le septième jour, Dieu se repose. C'est pour cela que, pour les juifs et les chrétiens, la semaine compte sept jours, avec un jour consacré au repos.",
         "And on the seventh day, God rests. That is why, for Jews and Christians, the week has seven days, with one day devoted to rest."),
    ], "neutral"),
    ("pause", 0.4),

    ("scene", "sky"),
    ("say", "claude", [
        ("Les historiens ajoutent une autre piste : les Babyloniens observaient sept astres qui bougent dans le ciel.", "Historians add another clue: the Babylonians watched seven bodies moving across the sky."),
        ("Le Soleil, la Lune, Mars, Mercure, Jupiter, Vénus et Saturne. Et la Lune change de phase environ tous les sept jours.", "The Sun, the Moon, Mars, Mercury, Jupiter, Venus and Saturn. And the Moon changes phase about every seven days."),
    ], "neutral"),
    ("cue", "cycles"),
    ("say", "claude", [
        ("Et la science ? Le jour, c'est la Terre qui tourne sur elle-même. Le mois, à peu près le cycle de la Lune. L'année, le tour du Soleil.",
         "And science? A day is the Earth spinning. A month, roughly the Moon's cycle. A year, one trip around the Sun."),
        ("Mais la semaine ne suit aucun cycle exact de la nature : c'est une invention humaine.", "But the week follows no exact natural cycle: it's a human invention."),
    ], "neutral"),
    ("cue", "fails"),
    ("say", "claude", [
        ("La Révolution française a essayé une semaine de dix jours. L'Union soviétique, des semaines de cinq, puis six jours. Les deux ont échoué : on est revenus à sept.",
         "The French Revolution tried a ten-day week. The Soviet Union tried five-day, then six-day weeks. Both failed: we went back to seven."),
    ], "happy"),
    ("pause", 0.4),

    ("scene", "names"),
    ("say", "claude", [
        ("Les Romains ont adopté la semaine de sept jours, et ont donné à chaque jour le nom d'un astre… et donc d'un dieu. Le français vient du latin.",
         "The Romans adopted the seven-day week, and named each day after a heavenly body… and so after a god. French comes from Latin."),
    ], "neutral"),
    ("cue", "lundi"),
    ("say", "claude", [
        ("Lundi : le jour de la Lune.", "Monday, lundi: the day of the Moon."),
        ("Mardi : le jour de Mars, dieu de la guerre.", "Tuesday, mardi: the day of Mars, god of war."),
        ("Mercredi : le jour de Mercure, le messager des dieux.", "Wednesday, mercredi: the day of Mercury, messenger of the gods."),
        ("Jeudi : le jour de Jupiter, roi des dieux.", "Thursday, jeudi: the day of Jupiter, king of the gods."),
        ("Vendredi : le jour de Vénus, déesse de l'amour.", "Friday, vendredi: the day of Venus, goddess of love."),
    ], "happy"),
    ("cue", "samedi"),
    ("say", "claude", [
        ("Pour les deux derniers, c'est la Bible. Samedi vient du Shabbat, le jour du repos selon la Genèse.", "For the last two, it's the Bible. Saturday, samedi, comes from the Sabbath, the day of rest in Genesis."),
        ("Et dimanche veut dire « le jour du Seigneur » : pour les chrétiens, le jour où Jésus est ressuscité, selon les Évangiles.", "And Sunday, dimanche, means \"the Lord's day\": for Christians, the day Jesus rose again, according to the Gospels."),
    ], "neutral"),
    ("cue", "thor"),
    ("say", "claude", [
        ("Et en anglais ? Les noms viennent des dieux nordiques : Thursday, c'est le jour de Thor !", "And in English? The names come from Norse gods: Thursday is Thor's day!"),
    ], "happy"),
    ("pause", 0.4),

    ("scene", "weekend"),
    ("say", "claude", [
        ("En 321, l'empereur Constantin fait du dimanche un jour de repos. En France, la loi de 1906 rend obligatoire un jour de repos par semaine.",
         "In 321, Emperor Constantine makes Sunday a day of rest. In France, a 1906 law makes one day of rest a week mandatory."),
    ], "neutral"),
    ("cue", "ford"),
    ("say", "claude", [
        ("En 1926, Henry Ford donne à ses ouvriers le samedi et le dimanche. Le week-end moderne est né… et le lundi devient le jour de la rentrée.",
         "In 1926, Henry Ford gives his workers Saturday and Sunday off. The modern weekend is born… and Monday becomes back-to-work day."),
    ], "happy"),
    ("pause", 0.4),

    ("scene", "marc"),
    ("say", "claude", [("Voici Marc. C'est un personnage imaginé.", "This is Marc. He is an imagined character.")], "neutral"),
    ("say", "marc", [("Encore lundi… et j'ai raté mon bus !", "Monday again… and I missed my bus!")], "sad"),
    ("pause", 0.3),
    ("cue", "why"),
    ("say", "claude", [
        ("Pourquoi Marc souffre ? D'abord, la biologie. Le week-end, il se couche et se lève plus tard. Le lundi, son horloge interne est décalée, comme après un voyage en avion.",
         "Why does Marc suffer? First, biology. On weekends he goes to bed and gets up later. On Monday, his body clock is out of sync, like after a plane trip."),
        ("Les chercheurs appellent ça le « jet lag social ».", "Researchers call it \"social jet lag\"."),
    ], "neutral"),
    ("cue", "psy"),
    ("say", "claude", [
        ("Ensuite, la psychologie. Dès le dimanche soir, on pense déjà au lundi : l'angoisse arrive avant lui.", "Then, psychology. By Sunday evening, we're already thinking about Monday: the anxiety arrives before it does."),
        ("Et pour les sciences humaines, le lundi est un symbole : la frontière entre le temps libre et le temps des obligations.", "And for the social sciences, Monday is a symbol: the border between free time and obligations."),
    ], "neutral"),
    ("pause", 0.4),

    ("scene", "myths"),
    ("say", "claude", [
        ("Le « Blue Monday », le jour soi-disant le plus déprimant de l'année ? C'est une campagne de publicité, inventée en 2005 pour une agence de voyages.",
         "\"Blue Monday\", supposedly the most depressing day of the year? It's an ad campaign, invented in 2005 for a travel agency."),
    ], "happy"),
    ("cue", "gallup"),
    ("say", "claude", [
        ("Et une grande étude de l'institut Gallup, sur plus de trois cent mille Américains, montre que le moral du lundi est presque le même que celui du mardi, du mercredi ou du jeudi.",
         "And a big Gallup study of over 300,000 Americans shows that Monday mood is almost the same as Tuesday, Wednesday or Thursday."),
        ("Ce qui change vraiment, c'est le week-end : là, on se sent mieux. Et une analyse de 2011 suggère que le lundi paraît surtout pire… quand on s'en souvient après coup.",
         "What really changes is the weekend: that's when we feel better. And a 2011 analysis suggests Monday mostly seems worse… when we remember it afterwards."),
    ], "neutral"),
    ("pause", 0.4),

    ("scene", "lovers"),
    ("say", "claude", [("Mais tout le monde ne déteste pas le lundi.", "But not everyone hates Monday.")], "happy"),
    ("say", "ines", [("Moi, j'ai trop hâte de retrouver mes amis au lycée !", "I can't wait to see my friends at school!")], "joy"),
    ("cue", "aicha"),
    ("say", "aicha", [("Moi, je suis infirmière, je travaille le week-end. Le lundi, c'est mon jour de repos !", "I'm a nurse, I work weekends. Monday is my day off!")], "happy"),
    ("cue", "fresh"),
    ("say", "claude", [
        ("Inès et Aïcha sont imaginées, mais des chercheurs ont observé « l'effet nouveau départ » : on prend plus souvent de bonnes résolutions un lundi, comme au Nouvel An.",
         "Inès and Aïcha are imagined, but researchers have observed the \"fresh start effect\": we make good resolutions more often on a Monday, like on New Year's."),
    ], "happy"),
    ("pause", 0.4),

    ("scene", "tips"),
    ("say", "claude", [
        ("Pour un meilleur lundi : garde à peu près les mêmes heures de sommeil le week-end, prépare ta semaine dès le vendredi, et prévois quelque chose d'agréable le lundi.",
         "For a better Monday: keep roughly the same sleep hours on weekends, plan your week on Friday, and schedule something nice for Monday."),
    ], "happy"),
    ("cue", "question"),
    ("say", "claude", [
        ("Et toi, le lundi, tu l'aimes ou tu le détestes ?", "And you, do you love Mondays or hate them?"),
        ("Dis-le en commentaire.", "Tell me in the comments."),
    ], "happy"),
    ("pause", 1.6),
]
