# Episode 37 - Le roi qui avait enferme 72 demons (Ars Goetia, Petite Cle de Salomon)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Selon un vieux grimoire, un roi aurait capturé 72 démons… et les aurait enfermés dans un vase de bronze.",
         "According to an old grimoire, a king captured 72 demons… and locked them in a bronze vessel."),
    ], "serious"),
    ("cue", "title"),
    ("title", "LE ROI QUI AVAIT ENFERMÉ\\N72 DÉMONS", "The king who locked up 72 demons", 2.8),
    ("pause", 2.6),

    ("scene", "grimoire"),
    ("say", "claude", [
        ("Ce grimoire s'appelle la Petite Clé de Salomon. Il a cinq parties, et la première, l'Ars Goetia, est la plus célèbre : un catalogue de 72 esprits, chacun avec son rang, ses légions, ses pouvoirs… et son sceau.",
         "This grimoire is called the Lesser Key of Solomon. It has five parts, and the first, the Ars Goetia, is the most famous: a catalogue of 72 spirits, each with its rank, its legions, its powers… and its seal."),
    ], "neutral"),
    ("cue", "date"),
    ("say", "claude", [
        ("Les manuscrits datent du dix-septième siècle, en Angleterre. Mais ils prétendent remonter au roi Salomon, qui aurait vécu il y a près de 3 000 ans.",
         "The manuscripts date from the seventeenth century, in England. But they claim to go back to King Solomon, who supposedly lived nearly 3,000 years ago."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "salomon"),
    ("say", "claude", [
        ("Dans une légende plus ancienne, Salomon reçoit de l'archange Michel un anneau magique, qui lui permet de commander aux démons. Il les fait même travailler à la construction du Temple de Jérusalem.",
         "In an older legend, Solomon receives a magic ring from the archangel Michael, which lets him command demons. He even makes them work on building the Temple in Jerusalem."),
    ], "neutral"),
    ("cue", "vase"),
    ("say", "claude", [
        ("Selon la Goetia, il enferme ensuite les 72 dans un vase de bronze, scellé, et le jette au fond d'un lac, à Babylone.",
         "According to the Goetia, he then locks the 72 in a sealed bronze vessel, and throws it to the bottom of a lake, in Babylon."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "babylone"),
    ("say", "claude", [
        ("Bien plus tard, des Babyloniens trouvent le vase. Ils croient qu'il cache un trésor… et le brisent. Les 72 s'échappent, et retournent chacun à sa place.",
         "Much later, some Babylonians find the vessel. They think it hides a treasure… and break it open. The 72 escape, and each returns to its place."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "cour"),
    ("say", "claude", [
        ("Le texte les range comme une cour royale : des rois, des ducs, des princes, des marquis, des présidents, des comtes, et même un chevalier.",
         "The text ranks them like a royal court: kings, dukes, princes, marquises, presidents, earls, and even one knight."),
    ], "neutral"),
    ("cue", "bael"),
    ("say", "claude", [
        ("Le premier, Baël, est un roi qui règne à l'est et commanderait 66 légions. Il rendrait invisible.",
         "The first, Bael, is a king who rules in the east and supposedly commands 66 legions. He grants invisibility."),
    ], "serious"),
    ("cue", "autres"),
    ("say", "claude", [
        ("Agarès enseignerait toutes les langues. Vassago révélerait le passé et l'avenir. Paimon, à dos de dromadaire, enseignerait les arts et les sciences. Et le dernier, Andromalius, ferait rendre les objets volés.",
         "Agares supposedly teaches every language. Vassago reveals the past and the future. Paimon, riding a dromedary, teaches the arts and sciences. And the last, Andromalius, makes thieves return stolen goods."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "wier"),
    ("date", "1577", "1577", 2.0),
    ("pause", 0.3),
    ("say", "claude", [
        ("Mais cette liste n'est pas si ancienne. En 1577, le médecin Jean Wier en publie une presque identique, avec 69 démons. Son but : montrer à quel point ces croyances sont absurdes. Il s'opposait d'ailleurs aux chasses aux sorcières.",
         "But this list isn't that old. In 1577, the physician Johann Weyer publishes an almost identical one, with 69 demons. His goal: to show how absurd these beliefs are. He also opposed the witch hunts."),
    ], "neutral"),
    ("cue", "ironie"),
    ("say", "claude", [
        ("Ironie : sa liste a sans doute servi de modèle au grimoire.",
         "The irony: his list very likely served as the model for the grimoire."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "pop"),
    ("say", "claude", [
        ("En 1904, une traduction anglaise la rend célèbre. Aujourd'hui, Paimon, Asmodée ou Bélial apparaissent dans des jeux vidéo, des séries et des mangas.",
         "In 1904, an English translation makes it famous. Today, Paimon, Asmodeus or Belial appear in video games, series and manga."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("Une légende de roi, un médecin sceptique et des copistes anonymes… Selon toi, pourquoi ces vieux grimoires fascinent-ils encore autant ? Dis-le-moi en commentaire.",
         "A king's legend, a sceptical physician and anonymous copyists… Why do you think these old grimoires still fascinate us so much? Tell me in the comments."),
    ], "serious"),
    ("pause", 1.6),
]
