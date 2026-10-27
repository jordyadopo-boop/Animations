# Episode 26 - Les trous blancs existent-ils ?
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.4),
    ("say", "claude", [
        ("Tout le monde connaît les trous noirs : rien n'en ressort. Mais les équations d'Einstein autorisent aussi leur contraire : un objet où rien ne peut entrer… et d'où tout jaillit.",
         "Everyone knows black holes: nothing comes out. But Einstein's equations also allow their opposite: an object nothing can enter… and everything bursts out of."),
    ], "serious"),
    ("cue", "title"),
    ("title", "LES TROUS BLANCS EXISTENT-ILS ?", "Do white holes exist?", 2.6),
    ("pause", 2.4),

    ("scene", "noir"),
    ("say", "claude", [
        ("Un trou noir, c'est une région où la gravité est si forte que même la lumière ne peut plus en sortir. En 2019, on a même photographié l'ombre de l'un d'eux.",
         "A black hole is a region where gravity is so strong that not even light can escape. In 2019, we even photographed the shadow of one."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "envers"),
    ("say", "claude", [
        ("Or les équations de la relativité générale fonctionnent aussi quand on passe le film à l'envers.",
         "Yet the equations of general relativity also work when you run the film backwards."),
    ], "neutral"),
    ("cue", "blanc"),
    ("say", "claude", [
        ("Le trou noir devient alors un trou blanc : impossible d'y entrer, la matière et la lumière ne font qu'en sortir.",
         "The black hole then becomes a white hole: impossible to enter, matter and light only come out."),
    ], "happy"),
    ("pause", 0.3),

    ("scene", "pont"),
    ("say", "claude", [
        ("En 1935, Einstein et Nathan Rosen décrivent un « pont » entre deux régions de l'espace. En prolongeant ces calculs, les physiciens découvrent qu'un trou noir peut y être relié à son contraire : un trou blanc.",
         "In 1935, Einstein and Nathan Rosen describe a \"bridge\" between two regions of space. Extending these calculations, physicists find that a black hole can be connected there to its opposite: a white hole."),
    ], "neutral"),
    ("cue", "novikov"),
    ("say", "claude", [
        ("Dans les années 1960, deux physiciens, Igor Novikov et Yuval Ne'eman, proposent qu'ils existent vraiment.",
         "In the 1960s, two physicists, Igor Novikov and Yuval Ne'eman, suggest they really exist."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "instable"),
    ("say", "claude", [
        ("Mais personne n'en a jamais observé. Et en 1974, le physicien Douglas Eardley montre qu'un trou blanc serait instable : un peu de matière qui tombe dessus suffirait à le transformer… en trou noir.",
         "But no one has ever observed one. And in 1974, physicist Douglas Eardley shows that a white hole would be unstable: a little matter falling onto it would be enough to turn it… into a black hole."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "grb"),
    ("say", "claude", [
        ("En 2006, les télescopes captent un étrange éclair de rayons gamma : il dure longtemps, mais sans explosion d'étoile visible. Deux astronomes ont proposé que ce soit un trou blanc. Ce n'est qu'une hypothèse.",
         "In 2006, telescopes catch a strange gamma-ray flash, GRB 060614: it lasts a long time, but with no visible exploding star. Two astronomers suggested it could be a white hole. It's only a hypothesis."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "rovelli"),
    ("say", "claude", [
        ("Aujourd'hui, le physicien Carlo Rovelli et ses collègues proposent une idée folle : en fin de vie, un trou noir pourrait « rebondir » et devenir un trou blanc.",
         "Today, physicist Carlo Rovelli and his colleagues propose a wild idea: at the end of its life, a black hole could \"bounce\" and become a white hole."),
    ], "happy"),
    ("cue", "matiere"),
    ("say", "claude", [
        ("Il en resterait de minuscules, qui pourraient expliquer une partie de la mystérieuse matière noire.",
         "Tiny ones might be left over, which could explain part of the mysterious dark matter."),
    ], "neutral"),
    ("cue", "bigbang"),
    ("say", "claude", [
        ("Et certains se demandent même si le Big Bang n'était pas une sorte de trou blanc. Là, on est en pleine spéculation.",
         "And some even wonder whether the Big Bang was a kind of white hole. Here, we're in full speculation."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "fin"),
    ("say", "claude", [
        ("Alors, les trous blancs existent-ils ? Peut-être… ou peut-être qu'ils ne vivent que sur le papier.",
         "So, do white holes exist? Maybe… or maybe they only live on paper."),
    ], "neutral"),
    ("cue", "question"),
    ("say", "claude", [("Et toi, tu y crois ? Dis-le-moi en commentaire.", "And you, do you believe in them? Tell me in the comments.")], "happy"),
    ("pause", 1.6),
]
