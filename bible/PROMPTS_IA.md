# PÉPIN ! — Kit pour produire la série avec des outils d'IA

Ce kit transforme la bible (`BIBLE.md`) en **prompts prêts à copier-coller**.
Les prompts sont en anglais : les générateurs d'images et de vidéos les comprennent mieux.

---

## 1. Les outils conseillés (chaîne de production)

| Étape | Outil conseillé | Pourquoi | Alternative |
|---|---|---|---|
| Fiches personnages (images) | **Midjourney** | Le plus beau rendu cartoon ; garde le même personnage d'une image à l'autre (fonction de référence de personnage) | Leonardo.ai, Ideogram |
| Animation des plans (vidéo) | **Kling AI** | Très bon en mouvements cartoon et en « image → vidéo » ; plans de 5 à 10 s | Runway (références de personnages), Google Veo, Hailuo (MiniMax), Luma |
| Musique | **Suno** | Musique instrumentale cartoon sur demande | Udio |
| Bruitages | **ElevenLabs** (effets sonores) | BOÏNG, SPLATCH, sifflets, vent… générés à partir d'un texte | Bibliothèques gratuites (Pixabay, Freesound) |
| Montage + onomatopées + formats TikTok | **CapCut** | Simple, gratuit, export 9:16 et 16:9, textes animés | DaVinci Resolve (gratuit, plus pro) |

**La méthode qui marche :**
1. Créer **une image de référence par personnage** (fiche de face, de profil et de dos) et **toujours la réutiliser**.
2. Animer **plan par plan** en mode *image → vidéo*, à partir d'une image du plan où le personnage de référence est déjà en place.
3. Assembler, mettre la musique, les bruitages et les onomatopées dans CapCut.

**Limites à connaître :**
- La cohérence d'un plan à l'autre reste le point faible de ces outils. Il faut générer plusieurs essais par plan et garder le meilleur.
- Les plans font 5 à 10 s : un épisode de 7 min demande environ 50 à 80 plans.
- Ces outils sont payants (abonnements mensuels). Vérifie leurs conditions d'utilisation commerciale avant de publier.

---

## 2. Le style (à mettre au début de CHAQUE prompt)

**Style 3D (comme Oscar & Co) :**
> `3D cartoon animation style, soft sculpted clay-like characters, no outlines, bright natural colors, giant redwood forest above a sea of white clouds, warm sunlight, cinematic lighting, expressive exaggerated faces, slapstick comedy, 16:9`

**Style rétro noir et blanc (rubber hose années 30) :**
> `1930s rubber hose cartoon style, thick black ink outlines on cream paper, black and white only, pie-cut eyes, white gloves, bendy limbs, hand-drawn, old film grain, slapstick comedy, 16:9`

---

## 3. Fiches personnages

### PÉPIN — le héros (écureuil volant)
> `[STYLE], character sheet, front view, side view and back view of PEPIN, a scrawny skinny flying squirrel, small thin body, long stick-like limbs, oversized head with a long snout, huge bulging amber eyes with heavy sleepy eyelids, thick bushy eyebrows, two big crooked buck teeth, a messy dark tuft of hair on top of his head, pointy ears (left ear slightly shorter and dented), brown-grey back, cinnamon sides, cream belly, gliding skin membrane between wrists and ankles with a dark edge, big flat bushy tail, big hands with long fingers, clever and lazy personality, white background`

### MARGOT — la pie (cheffe du trio, la rapide)
> `[STYLE], character sheet of MARGOT, a sleek slim magpie, arrow-shaped silhouette, glossy black feathers with blue-green shine, white belly and white wing patches, very long tail, long pointed black beak, sly half-closed eyes with yellow iris and pinpoint pupils, V-shaped frowning brows, vain smirk, villain but not scary, white background`

### BOUBOULE — le raton laveur (le gros lent)
> `[STYLE], character sheet of BOUBOULE, a big fat raccoon standing on two legs, pear-shaped body with a huge belly, short bowed legs, long heavy arms with dark hands, small head with a long snout, black bandit mask across the eyes, small mean yellow eyes, V-shaped brows, bully grin full of small sharp teeth, ringed bushy tail, slow and greedy, villain but funny, white background`

### TAC-TAC — le pic-vert (le bête)
> `[STYLE], character sheet of TAC-TAC, a skinny gangly green woodpecker, long thin neck, oversized round head, red cap of spiky feathers, very long straight beak, huge cross-eyed eyes, clumsy and stupid expression, thin legs, white background`

### BEC-DE-FER — l'aigle (le super-prédateur)
> `[STYLE], character sheet of BEC-DE-FER, a huge bald eagle, massive puffed chest, small white head, giant yellow hooked beak, heavy dark V-shaped brow ridges, cold glaring yellow eyes with pinpoint pupils, dark brown body, big yellow talons, menacing but comedic, white background`

### Le décor : la Canopée des Géants
> `[STYLE], environment design, giant redwood trees with red-orange fibrous bark rising above a sea of white clouds, thick branches connecting the trees, a cozy round tree hollow with moss, a tourist cable car line crossing between the treetops, bright blue sky, no characters`

---

## 4. Pilote « La Noisette d'or » — plans à animer (image → vidéo)

Pour chaque plan : générer l'image de départ avec Midjourney (style + personnage de référence + description), puis l'animer dans Kling avec le prompt de mouvement.

| # | Durée | Image de départ | Prompt de mouvement |
|---|---|---|---|
| 1 | 5 s | Lever de soleil sur la mer de nuages, Pépin endormi roulé en boule dans son trou d'arbre | `slow camera push-in toward the tree hollow, the squirrel breathes slowly while sleeping, morning light` |
| 2 | 5 s | Pépin dans son trou, les yeux fermés | `his belly growls and shakes, he opens one eye then the other, stretches out of the hollow with a huge yawn, neck stretching like rubber` |
| 3 | 5 s | Pépin sur une branche, la noisette dorée brille sur l'arbre d'en face | `the golden hazelnut sparkles, fast snap zoom on the nut, cut to the squirrel's eyes bulging out of his head, drooling` |
| 4 | 5 s | Pépin accroupi au bout de la branche | `anticipation crouch then he leaps and glides with his membrane spread wide, happy face, camera follows` |
| 5 | 5 s | Pépin en vol plané | `a strong gust of wind pushes him backwards, his face squashed by the wind, he spins and falls then swoops forward fast` |
| 6 | 5 s | Pépin qui fonce vers un gros tronc | `he smashes flat against the tree trunk like a pancake, impact lines, he stays stuck then slowly slides down the bark, eyes crossed` |
| 7 | 5 s | Pépin rampe sur une branche vers la noisette | `tiptoeing sneakily, a huge shadow grows over him, he looks up in terror` |
| 8 | 5 s | L'aigle en piqué vers la branche | `the eagle dives, the squirrel jumps back at the last second, the eagle's beak gets stuck in the branch and its body vibrates like a spring` |
| 9 | 5 s | Pépin assis sur une brindille qui plie, la noisette au bout | `the twig bends under his weight, the hazelnut pops free, the twig springs back and catapults him into the sky` |
| 10 | 5 s | Pépin dans le ciel, la noisette dans les mains | `the magpie zooms past and snatches the hazelnut, the squirrel stares at the camera with empty hands, deadpan, then falls` |
| 11 | 8 s | Poursuite en vol, la pie devant avec la noisette | `the squirrel glides above the sun and casts a giant eagle-shaped shadow on a cloud in front of the magpie, she panics and drops the nut` |
| 12 | 5 s | Pépin rattrape la noisette | `he catches the falling nut, smug grin; behind the magpie the real eagle appears, she flees in panic` |
| 13 | 8 s | Pépin assis devant son trou, il croque la noisette | `the nut cracks open, it's empty except a tiny worm who waves hello, the squirrel looks at the camera, ears drooping, iris-out` |

**Générique de fin (à faire dans CapCut) :** « Une série créée par **Jordy Adopo** », jordy.adopo@outlook.fr, +225 07 09 95 10 92, « © Jordy Adopo — tous droits réservés ».

---

## 5. Musique et bruitages

**Musique (Suno, mode instrumental) :**
> `instrumental cartoon slapstick music, 1930s style, xylophone, pizzicato strings, tuba, clarinet, playful and mischievous, fast tempo, no vocals`

**Thème de Bec-de-Fer :**
> `short menacing cartoon brass sting, low trombones and tuba, villain entrance, 3 seconds`

**Thème de Margot :**
> `sneaky descending chromatic clarinet, sly villain cartoon theme, pizzicato bass, 5 seconds`

**Bruitages (ElevenLabs) :** `cartoon boing spring`, `cartoon splat`, `slide whistle down`, `slide whistle up`, `strong whoosh wind gust`, `eagle screech`, `magpie squawk`, `cartoon crack nut`, `sad trombone wah wah wah`.
