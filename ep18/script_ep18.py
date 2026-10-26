# Episode 18 - Le jour ou la Joconde a disparu (vol de 1911)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "peruggia": dict(voice="fr-FR-HenriNeural", rate="+2%", pitch="-2Hz"),
    "beroud": dict(voice="fr-CH-FabriceNeural", rate="+0%", pitch="+0Hz"),
    "gardien": dict(voice="fr-CA-AntoineNeural", rate="-4%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Un lundi matin de 1911, le tableau le plus célèbre du monde disparaît du Louvre.", "One Monday morning in 1911, the most famous painting in the world vanishes from the Louvre."),
    ], "serious"),
    ("cue", "empty"),
    ("say", "claude", [
        ("Et à l'époque… il n'était même pas encore le plus célèbre.", "And back then… it wasn't even the most famous yet."),
    ], "neutral"),
    ("cue", "title"),
    ("title", "LE JOUR OÙ LA JOCONDE A DISPARU", "The day the Mona Lisa vanished", 2.6),
    ("pause", 2.5),

    ("scene", "vol"),
    ("date", "Paris, lundi 21 août 1911", "Paris, Monday 21 August 1911", 2.8),
    ("pause", 0.5),
    ("say", "claude", [
        ("Le lundi, le Louvre est fermé au public. Un homme en blouse blanche, comme celle des ouvriers du musée, décroche la Joconde,", "On Mondays, the Louvre is closed to the public. A man in a white smock, like the museum workers wear, takes down the Mona Lisa,"),
    ], "serious"),
    ("cue", "stairs"),
    ("say", "claude", [
        ("retire son cadre dans un escalier… et sort avec le tableau caché sous ses vêtements.", "removes its frame in a stairwell… and walks out with the painting hidden under his clothes."),
    ], "serious"),
    ("cue", "versions"),
    ("say", "claude", [
        ("Les versions diffèrent sur les détails : certains disent qu'il s'était caché dans le musée la veille au soir. Mais une chose est sûre : personne ne l'arrête.",
         "Accounts differ on the details: some say he had hidden in the museum the night before. But one thing is certain: nobody stops him."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "decouverte"),
    ("date", "Mardi 22 août 1911", "Tuesday 22 August 1911", 2.4),
    ("pause", 0.4),
    ("say", "claude", [("Le lendemain, un peintre, Louis Béroud, vient faire un tableau dans la salle.", "The next day, a painter, Louis Béroud, comes to paint in the gallery.")], "neutral"),
    ("cue", "where"),
    ("say", "beroud", [("Où est la Joconde ?", "Where is the Mona Lisa?")], "awe"),
    ("say", "gardien", [("Sûrement chez le photographe, monsieur.", "Probably at the photographer's, sir.")], "neutral"),
    ("cue", "hours"),
    ("say", "claude", [("Il faut des heures pour comprendre qu'elle a été volée. Le Louvre ferme toute une semaine.", "It takes hours to realize she has been stolen. The Louvre closes for a whole week.")], "serious"),
    ("pause", 0.3),

    ("scene", "suspects"),
    ("say", "claude", [
        ("La police cherche partout. Le poète Guillaume Apollinaire est arrêté et passe quelques jours en prison. Le jeune peintre Pablo Picasso est interrogé.",
         "The police search everywhere. The poet Guillaume Apollinaire is arrested and spends a few days in prison. The young painter Pablo Picasso is questioned."),
    ], "neutral"),
    ("cue", "statues"),
    ("say", "claude", [
        ("Ils n'avaient pas volé la Joconde… mais un ancien secrétaire d'Apollinaire avait volé de petites statues au Louvre, et Picasso en avait acheté. Tous deux ont finalement été libérés.",
         "They hadn't stolen the Mona Lisa… but a former secretary of Apollinaire had stolen small statues from the Louvre, and Picasso had bought some. Both were eventually released."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "foule"),
    ("say", "claude", [
        ("Et là, il se passe quelque chose d'incroyable : quand le musée rouvre, des foules entières viennent voir… l'emplacement vide.",
         "And then something incredible happens: when the museum reopens, whole crowds come to see… the empty spot."),
    ], "happy"),
    ("cue", "star"),
    ("say", "claude", [("Les journaux du monde entier parlent d'elle. La Joconde devient une star.", "Newspapers all over the world talk about her. The Mona Lisa becomes a star.")], "happy"),
    ("pause", 0.3),

    ("scene", "voleur"),
    ("say", "claude", [
        ("Pendant plus de deux ans, le tableau dort dans une malle, dans une petite chambre à Paris.", "For more than two years, the painting sleeps in a trunk, in a small room in Paris."),
        ("Le voleur s'appelle Vincenzo Peruggia : un vitrier italien qui avait justement travaillé au Louvre.", "The thief is Vincenzo Peruggia: an Italian glazier who had actually worked at the Louvre."),
    ], "neutral"),
    ("cue", "florence"),
    ("date", "Florence, décembre 1913", "Florence, December 1913", 2.6),
    ("say", "claude", [
        ("En décembre 1913, il propose le tableau à un marchand d'art de Florence. Le directeur du musée des Offices vient le voir… et reconnaît la vraie Joconde. Peruggia est arrêté.",
         "In December 1913, he offers the painting to an art dealer in Florence. The director of the Uffizi museum comes to see it… and recognizes the real Mona Lisa. Peruggia is arrested."),
    ], "serious"),
    ("cue", "why"),
    ("say", "peruggia", [("Je voulais la ramener en Italie ! Napoléon nous l'avait volée !", "I wanted to bring her back to Italy! Napoleon stole her from us!")], "angry"),
    ("cue", "false"),
    ("say", "claude", [
        ("Sauf que c'est faux : c'est Léonard de Vinci lui-même qui l'avait apportée en France, où le roi François Ier l'a achetée.",
         "Except that's wrong: Leonardo da Vinci himself brought her to France, where King Francis I bought her."),
        ("Peruggia ne fait que quelques mois de prison. En janvier 1914, la Joconde retrouve son mur au Louvre.", "Peruggia serves only a few months in prison. In January 1914, the Mona Lisa returns to her wall at the Louvre."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "aujourdhui"),
    ("say", "claude", [("Aujourd'hui, des millions de personnes viennent la voir chaque année. Et c'est un vol qui l'a rendue immortelle.", "Today, millions of people come to see her every year. A theft made her immortal.")], "happy"),
    ("cue", "question"),
    ("say", "claude", [("Et toi… tu serais allé voir le mur vide ? Dis-le-moi en commentaire.", "And you… would you have gone to see the empty wall? Tell me in the comments.")], "happy"),
    ("pause", 1.6),
]
