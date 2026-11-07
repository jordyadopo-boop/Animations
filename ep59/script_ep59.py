# Episode 59 - Versez les sept coupes (Apocalypse 16, 1-3) - on remonte la Bible scene par scene
# NOUVEAU FORMAT : Mr A et Claude racontent l'histoire ensemble (dialogue)
# Citations : Louis Segond 1910 (francais) ; King James (sous-titres anglais) - domaine public
VOICES = {
    "claude": dict(voice="fr-FR-RemyMultilingualNeural", rate="+9%", pitch="+30Hz"),
    "mra": dict(voice="fr-CH-FabriceNeural", rate="+4%", pitch="+0Hz"),
    "voix": dict(voice="fr-FR-HenriNeural", rate="-6%", pitch="-4Hz"),
}

SCRIPT = [
    ("scene", "intro"),
    ("pause", 0.5),
    ("say", "mra", [
        ("Claude, imagine : la mer entière devient rouge, épaisse… et plus rien ne bouge dedans.",
         "Claude, imagine: the whole sea turns red, thick… and nothing moves in it anymore."),
    ], "serious"),
    ("cue", "serie"),
    ("say", "claude", [
        ("On remonte la Bible, scène par scène, Mister A. La dernière fois, les fleuves devenaient du sang. Juste avant, c'est la mer.",
         "We're going back through the Bible, scene by scene, Mr A. Last time, the rivers became blood. Just before, it's the sea."),
    ], "neutral"),
    ("cue", "avant"),
    ("say", "mra", [
        ("Et encore avant, tout commence par une voix, qui sort du temple.",
         "And even before that, it all starts with a voice, coming out of the temple."),
    ], "awe"),
    ("cue", "title"),
    ("title", "VERSEZ LES\\NSEPT COUPES", "Pour out the seven bowls", 2.8),
    ("pause", 2.6),

    ("scene", "temple"),
    ("say", "voix", [
        ("« Et j'entendis une voix forte qui venait du temple, et qui disait aux sept anges : Allez, et versez sur la terre les sept coupes de la colère de Dieu. »",
         "\"And I heard a great voice out of the temple saying to the seven angels, Go your ways, and pour out the vials of the wrath of God upon the earth.\""),
    ], "serious"),
    ("cue", "qui"),
    ("say", "mra", [
        ("Une voix qui sort du temple… C'est la voix de qui ?",
         "A voice coming out of the temple… Whose voice is it?"),
    ], "neutral"),
    ("cue", "fumee"),
    ("say", "claude", [
        ("Le texte ne le dit pas. Mais juste avant, le temple est rempli de fumée, à cause de la gloire de Dieu, et personne ne peut y entrer tant que les sept fléaux ne sont pas finis.",
         "The text doesn't say. But just before, the temple is filled with smoke, from the glory of God, and no one can enter it until the seven plagues are over."),
    ], "neutral"),
    ("cue", "dieu"),
    ("say", "mra", [
        ("Donc si personne ne peut entrer… la voix vient de Dieu lui-même ?",
         "So if no one can go in… the voice comes from God himself?"),
    ], "awe"),
    ("say", "claude", [
        ("C'est ce que beaucoup de lecteurs comprennent, oui.",
         "That's how many readers understand it, yes."),
    ], "neutral"),
    ("cue", "sept"),
    ("say", "mra", [
        ("Et pourquoi sept coupes ?",
         "And why seven bowls?"),
    ], "neutral"),
    ("cue", "complet"),
    ("say", "claude", [
        ("Dans l'Apocalypse, sept, c'est le chiffre de ce qui est complet. Sept églises, sept sceaux, sept trompettes… et maintenant, sept coupes. Le texte les appelle les derniers fléaux.",
         "In Revelation, seven is the number of completeness. Seven churches, seven seals, seven trumpets… and now, seven bowls. The text calls them the last plagues."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "ulcere"),
    ("say", "voix", [
        ("« Le premier alla, et il versa sa coupe sur la terre. Et un ulcère malin et douloureux frappa les hommes qui avaient la marque de la bête et qui adoraient son image. »",
         "\"And the first went, and poured out his vial upon the earth; and there fell a noisome and grievous sore upon the men which had the mark of the beast, and upon them which worshipped his image.\""),
    ], "serious"),
    ("cue", "seulement"),
    ("say", "mra", [
        ("Attends : seulement ceux qui ont la marque ?",
         "Wait: only those who have the mark?"),
    ], "awe"),
    ("cue", "marque"),
    ("say", "claude", [
        ("Oui. La marque de la bête, sur la main droite ou sur le front. Sans elle, au chapitre treize, personne ne pouvait acheter ni vendre.",
         "Yes. The mark of the beast, on the right hand or on the forehead. Without it, in chapter thirteen, no one could buy or sell."),
    ], "neutral"),
    ("cue", "tranquille"),
    ("say", "mra", [
        ("Donc ceux qui l'ont prise pour vivre tranquilles… sont justement ceux qui sont frappés.",
         "So those who took it to live in peace… are exactly the ones who are struck."),
    ], "serious"),
    ("pause", 0.3),

    ("scene", "egypte"),
    ("say", "claude", [
        ("Et ça rappelle encore l'Égypte : la sixième plaie. Moïse lance de la cendre vers le ciel, et des ulcères couvrent les hommes et les animaux.",
         "And it recalls Egypt again: the sixth plague. Moses throws ashes toward the sky, and sores break out on men and animals."),
    ], "neutral"),
    ("cue", "magiciens"),
    ("say", "claude", [
        ("Même les magiciens du pharaon ne peuvent plus se tenir devant Moïse, tellement ils sont couverts d'ulcères.",
         "Even Pharaoh's magicians can no longer stand before Moses, they are so covered in sores."),
    ], "neutral"),
    ("cue", "nil"),
    ("say", "mra", [
        ("L'Égypte, encore ! La dernière fois, c'était le Nil changé en sang.",
         "Egypt, again! Last time, it was the Nile turned to blood."),
    ], "happy"),
    ("say", "claude", [
        ("Exactement : les coupes reprennent les plaies d'Égypte, mais cette fois, à l'échelle du monde.",
         "Exactly: the bowls echo the plagues of Egypt, but this time, on a worldwide scale."),
    ], "awe"),
    ("pause", 0.3),

    ("scene", "mer"),
    ("say", "voix", [
        ("« Le second versa sa coupe dans la mer. Et elle devint du sang, comme celui d'un mort ; et tout être vivant mourut, tout ce qui était dans la mer. »",
         "\"And the second angel poured out his vial upon the sea; and it became as the blood of a dead man: and every living soul died in the sea.\""),
    ], "serious"),
    ("cue", "mort"),
    ("say", "mra", [
        ("« Comme le sang d'un mort »… Pourquoi « d'un mort » ?",
         "\"As the blood of a dead man\"… Why \"of a dead man\"?"),
    ], "neutral"),
    ("cue", "epais"),
    ("say", "claude", [
        ("Le sang d'un vivant circule, il est rouge vif. Le sang d'un mort s'arrête, il s'épaissit, il devient sombre. Et c'est toute la mer, comme ça.",
         "A living man's blood flows, bright red. A dead man's blood stops, it thickens, it turns dark. And the whole sea is like that."),
    ], "serious"),
    ("cue", "tiers"),
    ("say", "mra", [
        ("Mais la mer, elle n'avait pas déjà été frappée ?",
         "But hadn't the sea already been struck?"),
    ], "neutral"),
    ("cue", "trompette"),
    ("say", "claude", [
        ("Si, avec les trompettes, au chapitre huit : un tiers de la mer devenait du sang, et un tiers des créatures mouraient. Ici, ce n'est plus un tiers. C'est tout.",
         "Yes, with the trumpets, in chapter eight: a third of the sea became blood, and a third of the creatures died. Here, it's no longer a third. It's everything."),
    ], "awe"),
    ("cue", "surface"),
    ("say", "mra", [
        ("Et la mer, c'est plus de soixante-dix pour cent de la surface de la Terre…",
         "And the sea is more than seventy percent of the Earth's surface…"),
    ], "awe"),
    ("pause", 0.4),

    ("scene", "fin"),
    ("say", "claude", [
        ("Mais cette histoire est la suite d'une autre.",
         "But this story follows another one."),
    ], "neutral"),
    ("say", "mra", [
        ("Juste avant, sept anges sortent du temple. Un des quatre êtres vivants leur donne sept coupes d'or, pleines de la colère de Dieu.",
         "Just before, seven angels come out of the temple. One of the four living creatures gives them seven golden bowls, full of the wrath of God."),
    ], "serious"),
    ("say", "claude", [
        ("Et le temple se remplit de fumée. Ce sera le prochain épisode.",
         "And the temple fills with smoke. That's the next episode."),
    ], "serious"),
    ("pause", 1.6),
]
