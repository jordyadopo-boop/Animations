# Episode 44 - La mort elle-meme va mourir (Apocalypse 20, 11-15) - on remonte la Bible scene par scene
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "claude", [
        ("Un trône si éclatant que le ciel et la terre s'enfuient devant lui. Devant ce trône, tous les morts de l'histoire. Et à la fin… c'est la mort elle-même qui est jetée au feu.",
         "A throne so dazzling that heaven and earth flee before it. Before that throne, all the dead of history. And in the end… it is death itself that is thrown into the fire."),
    ], "serious"),
    ("cue", "serie"),
    ("say", "claude", [
        ("On remonte la Bible, scène par scène. La dernière fois, Dieu essuyait toute larme. Juste avant, Jean assiste au jugement des morts.",
         "We're going back through the Bible, scene by scene. Last time, God wiped away every tear. Just before, John witnesses the judgment of the dead."),
    ], "happy"),
    ("cue", "title"),
    ("title", "LA MORT ELLE-MÊME\\NVA MOURIR", "Death itself is going to die", 2.8),
    ("pause", 2.6),

    ("scene", "trone"),
    ("say", "voix", [
        ("« Puis je vis un grand trône blanc, et celui qui était assis dessus. La terre et le ciel s'enfuirent devant sa face, et il ne fut plus trouvé de place pour eux. »",
         "\"And I saw a great white throne, and him that sat on it, from whose face the earth and the heaven fled away; and there was found no place for them.\""),
    ], "serious"),
    ("cue", "fuite"),
    ("say", "claude", [
        ("Voilà pourquoi, dans l'épisode précédent, le premier ciel et la première terre avaient disparu : ils se sont enfuis devant ce trône.",
         "That's why, in the previous episode, the first heaven and the first earth had disappeared: they fled before this throne."),
    ], "awe"),
    ("cue", "blanc"),
    ("say", "claude", [
        ("Blanc, comme la pureté et la justice. Le prophète Daniel avait déjà vu une scène semblable : un être aux vêtements blancs comme la neige, assis sur un trône, qu'il appelle l'Ancien des jours.",
         "White, like purity and justice. The prophet Daniel had already seen a similar scene: a being in garments white as snow, seated on a throne, whom he calls the Ancient of Days."),
    ], "neutral"),
    ("cue", "qui"),
    ("say", "claude", [
        ("Et qui est assis dessus ? Jean ne donne pas de nom. Ailleurs, l'Évangile de Jean dit que le Père a remis tout jugement au Fils.",
         "And who sits on it? John gives no name. Elsewhere, the Gospel of John says the Father has committed all judgment to the Son."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "livres"),
    ("say", "voix", [
        ("« Et je vis les morts, les grands et les petits, qui se tenaient devant le trône. Des livres furent ouverts. Et un autre livre fut ouvert, celui qui est le livre de vie. »",
         "\"And I saw the dead, small and great, stand before God; and the books were opened: and another book was opened, which is the book of life.\""),
    ], "serious"),
    ("cue", "grands"),
    ("say", "claude", [
        ("Les grands et les petits : rois et esclaves, tous debout, au même niveau.",
         "Small and great: kings and slaves, all standing, on the same level."),
    ], "neutral"),
    ("cue", "deux"),
    ("say", "claude", [
        ("Et il y a deux sortes de livres. D'un côté, des livres où sont écrites les œuvres de chacun. De l'autre, un seul livre : le livre de vie, qui contient des noms.",
         "And there are two kinds of books. On one side, books where everyone's deeds are written. On the other, a single book: the book of life, which holds names."),
    ], "awe"),
    ("cue", "moise"),
    ("say", "claude", [
        ("L'idée est très ancienne. Dans la vision de Daniel, déjà, « les livres furent ouverts ». Et dans l'Exode, Moïse supplie Dieu de l'effacer de son livre plutôt que de punir son peuple.",
         "The idea is very old. In Daniel's vision, already, \"the books were opened\". And in Exodus, Moses begs God to blot him out of his book rather than punish his people."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "mer"),
    ("say", "voix", [
        ("« La mer rendit les morts qui étaient en elle, la mort et le séjour des morts rendirent les morts qui étaient en eux ; et chacun fut jugé selon ses œuvres. »",
         "\"And the sea gave up the dead which were in it; and death and hell delivered up the dead which were in them: and they were judged every man according to their works.\""),
    ], "serious"),
    ("cue", "oublie"),
    ("say", "claude", [
        ("La mer, d'abord. Dans l'Antiquité, mourir en mer était une terreur : sans tombe, pensaient les Grecs, l'âme errait sans repos. Ici, les marins disparus, les naufragés, tous ceux qui n'ont jamais eu de tombe reviennent. Personne n'est oublié.",
         "The sea, first. In antiquity, dying at sea was a terror: without a grave, the Greeks believed, the soul wandered without rest. Here, lost sailors, the shipwrecked, all those who never had a grave come back. No one is forgotten."),
    ], "awe"),
    ("cue", "hades"),
    ("say", "claude", [
        ("Le séjour des morts, en grec, c'est l'Hadès : le lieu où, selon les anciens, attendaient tous les défunts. Ici, il doit se vider.",
         "The abode of the dead, in Greek, is Hades: the place where, according to the ancients, all the departed waited. Here, it must empty out."),
    ], "neutral"),
    ("pause", 0.3),

    ("scene", "etang"),
    ("say", "voix", [
        ("« Et la mort et le séjour des morts furent jetés dans l'étang de feu. C'est la seconde mort, l'étang de feu. »",
         "\"And death and hell were cast into the lake of fire. This is the second death.\""),
    ], "serious"),
    ("cue", "ennemi"),
    ("say", "claude", [
        ("Voilà le retournement. La mort, celle qui a tout pris depuis la première page, est jetée à son tour. Saint Paul l'avait écrit : le dernier ennemi qui sera détruit, c'est la mort.",
         "Here is the reversal. Death, which has taken everything since the first page, is thrown away in turn. Saint Paul had written it: the last enemy to be destroyed is death."),
    ], "awe"),
    ("say", "voix", [
        ("« Quiconque ne fut pas trouvé écrit dans le livre de vie fut jeté dans l'étang de feu. »",
         "\"And whosoever was not found written in the book of life was cast into the lake of fire.\""),
    ], "serious"),
    ("cue", "debat"),
    ("say", "claude", [
        ("Ce verset est débattu depuis des siècles : punition sans fin pour les uns, disparition définitive pour d'autres. Le texte, lui, n'en dit pas plus.",
         "This verse has been debated for centuries: endless punishment for some, final disappearance for others. The text itself says no more."),
    ], "neutral"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre. Juste avant, une prison s'ouvre après mille ans. Satan est relâché, et il rassemble des peuples aussi nombreux que le sable de la mer… Ce sera le prochain épisode.",
         "But this story follows another one. Just before, a prison opens after a thousand years. Satan is released, and he gathers peoples as numerous as the sand of the sea… That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
