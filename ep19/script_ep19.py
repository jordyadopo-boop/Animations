# Episode 19 - Et si la Terre s'arretait ? (experience de pensee)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "ines": dict(voice="fr-BE-CharlineNeural", rate="+4%", pitch="+0Hz"),
    "tom": dict(voice="fr-CA-AntoineNeural", rate="+0%", pitch="+0Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("En ce moment, tu tournes à plus de 1 600 kilomètres à l'heure… sans rien sentir.", "Right now, you're spinning at more than 1,600 kilometres per hour… without feeling a thing."),
    ], "happy"),
    ("cue", "what"),
    ("say", "claude", [
        ("Que se passerait-il si la Terre s'arrêtait ? Rassure-toi : c'est impossible. Mais la science a la réponse.", "What would happen if the Earth stopped? Don't worry: it's impossible. But science has the answer."),
    ], "neutral"),
    ("cue", "title"),
    ("title", "ET SI LA TERRE S'ARRÊTAIT ?", "What if the Earth stopped?", 2.6),
    ("pause", 2.4),

    ("scene", "bus"),
    ("say", "claude", [
        ("À l'équateur, la Terre tourne à environ 1 670 kilomètres à l'heure. On ne sent rien, parce que tout tourne avec nous : le sol, l'air, les océans.",
         "At the equator, the Earth spins at about 1,670 kilometres per hour. We feel nothing, because everything spins with us: the ground, the air, the oceans."),
        ("Comme dans un bus qui roule sans à-coups.", "Like on a bus driving smoothly."),
    ], "neutral"),
    ("cue", "brake"),
    ("say", "claude", [
        ("Mais si la Terre s'arrêtait d'un coup, ce serait comme un bus qui pile. Tout ce qui n'est pas attaché au sol continuerait d'avancer vers l'est : l'air, l'eau, et nous avec.",
         "But if the Earth stopped all at once, it would be like a bus slamming on the brakes. Everything not attached to the ground would keep moving east: the air, the water, and us too."),
    ], "serious"),
    ("cue", "relief"),
    ("say", "claude", [("Bonne nouvelle : aucune force connue ne peut arrêter une planète en un instant.", "Good news: no known force can stop a planet in an instant.")], "happy"),
    ("pause", 0.3),

    ("scene", "lent"),
    ("say", "claude", [
        ("Imaginons plutôt qu'elle ralentisse doucement, jusqu'à s'arrêter. Une journée durerait alors… un an : six mois de jour, puis six mois de nuit.",
         "Let's imagine instead that it slows down gently, until it stops. One day would then last… a year: six months of daylight, then six months of night."),
    ], "neutral"),
    ("cue", "ines"),
    ("say", "ines", [("Six mois de soleil ? Génial, les vacances !", "Six months of sunshine? Great, holidays!")], "joy"),
    ("say", "tom", [("Et après, six mois de nuit… Non merci.", "And then six months of night… No thanks.")], "sad"),
    ("cue", "oceans"),
    ("say", "claude", [
        ("Et les océans ? Aujourd'hui, la rotation les pousse vers l'équateur. Sans elle, ils glisseraient vers les pôles.", "And the oceans? Today, the spin pushes them toward the equator. Without it, they would slide toward the poles."),
        ("En 2010, une simulation informatique a montré le résultat : deux grands océans aux pôles… et un seul immense continent autour de l'équateur.",
         "In 2010, a computer simulation showed the result: two great oceans at the poles… and a single huge continent around the equator."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "orbite"),
    ("say", "claude", [
        ("Et si la Terre quittait son orbite ? Elle filerait en ligne droite à environ 30 kilomètres par seconde.", "And what if the Earth left its orbit? It would fly off in a straight line at about 30 kilometres per second."),
        ("Le Soleil deviendrait une simple étoile… et les océans gèleraient en surface.", "The Sun would become just another star… and the oceans would freeze over."),
    ], "serious"),
    ("cue", "life"),
    ("say", "claude", [
        ("Certains chercheurs pensent que des microbes pourraient survivre un temps sous la glace, près des sources chaudes du fond des océans. Rien n'est sûr.",
         "Some researchers think microbes might survive for a while under the ice, near hot springs on the ocean floor. Nothing is certain."),
        ("Mais une chose l'est : des planètes vagabondes, sans étoile, existent vraiment dans notre galaxie.", "But one thing is: rogue planets, with no star, really exist in our galaxy."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("En vrai, la Terre ralentit bien… d'environ deux millièmes de seconde par siècle, à cause des marées de la Lune.", "In reality, the Earth is slowing down… by about two thousandths of a second per century, because of the Moon's tides."),
        ("Il faudra des millions d'années pour gagner ne serait-ce qu'une heure.", "It will take millions of years to gain even one hour."),
    ], "happy"),
    ("cue", "question"),
    ("say", "claude", [("Et toi, tu préférerais six mois de jour ou six mois de nuit ? Dis-le-moi en commentaire.", "And you, would you rather have six months of day or six months of night? Tell me in the comments.")], "happy"),
    ("pause", 1.6),
]
