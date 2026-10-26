# Episode 17 - Pas deux cerveaux pareils (les facons de penser)
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "awa": dict(voice="fr-FR-DeniseNeural", rate="+0%", pitch="+0Hz"),
    "hugo": dict(voice="fr-CH-FabriceNeural", rate="+2%", pitch="+0Hz"),
    "malik": dict(voice="fr-FR-HenriNeural", rate="+8%", pitch="+2Hz"),
    "mei": dict(voice="fr-BE-CharlineNeural", rate="-4%", pitch="+0Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Ferme les yeux et imagine une pomme rouge. Tu la vois ?", "Close your eyes and picture a red apple. Can you see it?"),
    ], "neutral"),
    ("cue", "heads"),
    ("say", "claude", [
        ("Certaines personnes ne voient… rien. Juste du noir. Et leur cerveau va très bien.", "Some people see… nothing. Just black. And their brain is perfectly fine."),
    ], "serious"),
    ("cue", "title"),
    ("title", "PAS DEUX CERVEAUX PAREILS", "No two brains alike", 2.6),
    ("pause", 2.4),
    ("say", "claude", [
        ("Aujourd'hui, on parle des différentes façons de penser. Aucune n'est meilleure qu'une autre.", "Today, we talk about the different ways of thinking. None is better than another."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "cafe"),
    ("say", "claude", [("Voici Awa. C'est un personnage imaginé.", "This is Awa. She is an imagined character.")], "neutral"),
    ("say", "awa", [
        ("Moi, quand je ferme les yeux, je ne vois aucune image. Mais je me souviens de tout, en mots et en faits.", "When I close my eyes, I see no image at all. But I remember everything, in words and facts."),
    ], "happy"),
    ("cue", "aphan"),
    ("say", "claude", [
        ("Ça s'appelle l'aphantasie. Le mot a été inventé en 2015 par le neurologue Adam Zeman.", "It's called aphantasia. The word was coined in 2015 by neurologist Adam Zeman."),
        ("Environ une à deux personnes sur cent seraient concernées.", "About one or two people in a hundred may have it."),
    ], "neutral"),
    ("cue", "hyper"),
    ("say", "claude", [
        ("À l'inverse, certaines personnes voient des images aussi nettes qu'un film : c'est l'hyperphantasie.", "On the other hand, some people see images as sharp as a movie: that's hyperphantasia."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "parc"),
    ("say", "claude", [("Autre surprise : tout le monde n'a pas une petite voix dans la tête.", "Another surprise: not everyone has a little voice in their head.")], "happy"),
    ("say", "hugo", [
        ("Une voix qui parle dans ma tête ? Non. Moi, je pense en images et en sensations.", "A voice talking in my head? No. I think in pictures and feelings."),
    ], "neutral"),
    ("cue", "anendo"),
    ("say", "claude", [
        ("En 2024, des chercheurs ont proposé un nom pour ça : l'anendophasie.", "In 2024, researchers proposed a name for it: anendophasia."),
        ("Ces personnes réfléchissent très bien… simplement autrement.", "These people think very well… just differently."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "stade"),
    ("say", "claude", [
        ("Et la vitesse ? Le psychologue Daniel Kahneman, prix Nobel, expliquait que nous avons tous deux façons de penser.", "And speed? Psychologist Daniel Kahneman, a Nobel laureate, explained that we all have two ways of thinking."),
    ], "neutral"),
    ("cue", "sys"),
    ("say", "claude", [
        ("Une rapide et automatique, qui reconnaît un visage en un instant.", "A fast, automatic one, that recognizes a face in an instant."),
        ("Et une lente et attentive, pour résoudre un calcul difficile.", "And a slow, careful one, to solve a hard calculation."),
    ], "neutral"),
    ("cue", "malik"),
    ("say", "malik", [("Au départ d'un cent mètres, je réagis au coup de pistolet en un clin d'œil !", "At the start of a 100 metres, I react to the starting gun in the blink of an eye!")], "joy"),
    ("cue", "gun"),
    ("say", "claude", [
        ("En athlétisme, partir moins d'un dixième de seconde après le coup de pistolet compte comme un faux départ : on considère que c'est trop rapide pour un humain.",
         "In athletics, leaving less than a tenth of a second after the gun counts as a false start: it's considered too fast for a human."),
    ], "happy"),
    ("cue", "mei"),
    ("say", "mei", [("Moi, je prends mon temps. Je réponds moins vite… mais je vérifie tout.", "I take my time. I answer more slowly… but I check everything.")], "happy"),
    ("cue", "rythme"),
    ("say", "claude", [
        ("Réagir vite ou réfléchir longtemps, ce n'est pas une question d'intelligence. Chacun a son rythme.", "Reacting fast or thinking long isn't a matter of intelligence. Everyone has their own pace."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "studio"),
    ("say", "claude", [
        ("Tu as sûrement entendu : « cerveau gauche, logique ; cerveau droit, créatif ».", "You've probably heard: \"left brain, logical; right brain, creative\"."),
    ], "neutral"),
    ("cue", "myth"),
    ("say", "claude", [
        ("En 2013, une étude sur plus de mille cerveaux n'a trouvé personne qui utilise un côté plus que l'autre. C'est un mythe.",
         "In 2013, a study of over a thousand brains found no one who uses one side more than the other. It's a myth."),
    ], "happy"),
    ("cue", "gardner"),
    ("say", "claude", [
        ("En 1983, le psychologue Howard Gardner a proposé l'idée d'intelligences multiples : avec les mots, les nombres, la musique, le corps, l'espace, les autres et soi-même.",
         "In 1983, psychologist Howard Gardner proposed multiple intelligences: with words, numbers, music, the body, space, other people and oneself."),
        ("Plus tard, il a ajouté la nature.", "Later, he added nature."),
    ], "neutral"),
    ("cue", "debate"),
    ("say", "claude", [
        ("Les chercheurs en débattent encore, mais elle rappelle une chose vraie : on peut briller de mille façons.", "Researchers still debate it, but it reminds us of something true: you can shine in a thousand ways."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "final"),
    ("say", "claude", [
        ("Pour l'autisme, les troubles de l'attention ou la dyslexie, on parle aujourd'hui de neurodiversité : des cerveaux qui fonctionnent autrement, avec leurs difficultés et leurs forces.",
         "For autism, attention disorders or dyslexia, we now speak of neurodiversity: brains that work differently, with their challenges and their strengths."),
    ], "neutral"),
    ("cue", "apple"),
    ("say", "claude", [
        ("Alors, la prochaine fois que quelqu'un pense différemment de toi… il n'a peut-être pas tort. Il voit peut-être… une autre pomme.",
         "So next time someone thinks differently from you… maybe they're not wrong. Maybe they just see… another apple."),
    ], "happy"),
    ("cue", "question"),
    ("say", "claude", [
        ("Et toi ? Tu vois la pomme ? Tu as une petite voix dans la tête ? Dis-le-moi en commentaire.", "And you? Can you see the apple? Do you have a little voice in your head? Tell me in the comments."),
    ], "happy"),
    ("cue", "next"),
    ("say", "claude", [("Prochain épisode : le jour où la Joconde a disparu.", "Next episode: the day the Mona Lisa disappeared.")], "joy"),
    ("pause", 1.6),
]
