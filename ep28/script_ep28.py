# Episode 28 - Le Colisee etait-il rempli d'eau ? (naumachies sous Titus, 80 apr. J.-C.)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "martial": dict(voice="fr-FR-HenriNeural", rate="+0%", pitch="-2Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.4),
    ("say", "claude", [
        ("Des navires de guerre… au milieu du Colisée. Des chevaux qui nagent là où, la veille, il y avait du sable. Les Romains ont-ils vraiment fait ça ?",
         "Warships… in the middle of the Colosseum. Horses swimming where, the day before, there was sand. Did the Romans really do that?"),
    ], "serious"),
    ("cue", "title"),
    ("title", "ILS ONT ESSAYÉ DE REMPLIR LE COLISÉE D'EAU", "They tried to fill the Colosseum with water", 2.8),
    ("pause", 2.7),

    ("scene", "inaug"),
    ("date", "80 apr. J.-C. · Rome", "80 AD · Rome", 2.6),
    ("pause", 0.4),
    ("say", "claude", [
        ("L'empereur Titus inaugure un amphithéâtre géant, construit à l'emplacement de l'ancien lac privé de Néron. Pour fêter ça, cent jours de spectacles.",
         "Emperor Titus opens a giant amphitheatre, built on the site of Nero's former private lake. To celebrate, a hundred days of shows."),
    ], "neutral"),
    ("cue", "arene"),
    ("say", "claude", [
        ("Au centre, une arène d'environ 80 mètres sur 48. Et autour, environ 50 000 spectateurs.",
         "In the centre, an arena about 80 by 48 metres. And around it, about 50,000 spectators."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "dion"),
    ("say", "claude", [
        ("Plus d'un siècle plus tard, l'historien Cassius Dion raconte : Titus remplit soudain l'arène d'eau, et y fait entrer des chevaux et des taureaux dressés à nager.",
         "More than a century later, historian Cassius Dio writes: Titus suddenly fills the arena with water, and brings in horses and bulls trained to swim."),
    ], "neutral"),
    ("cue", "bataille"),
    ("say", "claude", [
        ("Puis des hommes sur des navires rejouent une vieille bataille navale grecque, entre Corinthiens et Corcyréens.",
         "Then men on ships re-enact an old Greek sea battle, between Corinthians and Corcyreans."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "martial"),
    ("say", "claude", [
        ("Et on a un témoin direct : le poète Martial, présent ces années-là. Voici ce qu'il écrit.",
         "And we have a direct witness: the poet Martial, there in those years. Here is what he writes."),
    ], "neutral"),
    ("cue", "martial_dit"),
    ("say", "martial", [
        ("Toi qui arrives de loin : ici, tout à l'heure, c'était la terre. Tu ne me crois pas ? Attends un peu, et tu diras : ici, tout à l'heure, c'était la mer.",
         "You who come from afar: here, a moment ago, was land. You don't believe me? Wait a little, and you'll say: here, a moment ago, was the sea."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "doute"),
    ("say", "claude", [
        ("Mais beaucoup d'historiens doutent. L'arène est petite pour de vrais navires de guerre. Et aucun texte n'explique comment on la remplissait ni comment on la vidait.",
         "But many historians have doubts. The arena is small for real warships. And no text explains how it was filled or emptied."),
    ], "neutral"),
    ("cue", "hypo"),
    ("say", "claude", [
        ("L'hypothèse la plus courante : une eau peu profonde, apportée par un aqueduc voisin, juste de quoi faire flotter des bateaux plats.",
         "The most common hypothesis: shallow water, brought from a nearby aqueduct, just enough to float flat-bottomed boats."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "hypogee"),
    ("say", "claude", [
        ("Et il y a un indice. Quelques années plus tard, l'empereur Domitien fait creuser sous l'arène l'hypogée : deux étages de couloirs, de cages et de monte-charges.",
         "And there's a clue. A few years later, Emperor Domitian has the hypogeum dug under the arena: two levels of corridors, cages and lifts."),
    ], "neutral"),
    ("cue", "fini"),
    ("say", "claude", [
        ("Avec ces souterrains, impossible de remplir l'arène d'eau. Si les batailles navales ont eu lieu ici, c'était seulement dans les toutes premières années.",
         "With these tunnels, flooding the arena became impossible. If naval battles happened here, it was only in the very first years."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "auguste"),
    ("say", "claude", [
        ("Car les Romains savaient faire bien plus grand. En l'an 2 avant notre ère, Auguste fait creuser près du Tibre un bassin de plus de 500 mètres de long : trente navires, trois mille combattants.",
         "Because the Romans could go much bigger. In 2 BC, Augustus had a basin over 500 metres long dug near the Tiber: thirty ships, three thousand fighters."),
    ], "happy"),
    ("cue", "claude_avis"),
    ("say", "claude", [
        ("Au Colisée, c'était sans doute plus petit… mais selon les textes, l'eau y est bien entrée.",
         "At the Colosseum, it was probably smaller… but according to the texts, the water really did come in."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("Et toi, tu crois que le Colisée a vraiment été transformé en mer ? Oui ou non : dis-le-moi en commentaire.",
         "And you, do you think the Colosseum was really turned into a sea? Yes or no: tell me in the comments."),
    ], "happy"),
    ("pause", 1.6),
]
