---
title: Gérer le chargement des polices en export statique
date: 2026-08-12
category: study
tags: [Next.js, Performance, Polices]
summary: "Comment next/font récupère les polices au moment du build, et comment les sous-ensembles et les balises de préchargement sont générés dans un environnement output: export."
draft: true
---

Dans un environnement d'export statique, rien ne peut se passer au moment de la requête. Le format sous lequel la police est livrée, les caractères conservés, les balises injectées dans le document — tout est décidé au moment du build.

## Le problème

Après avoir déployé les fichiers de build sur un hébergement statique, j'ai remarqué que le texte du premier écran s'affichait brièvement dans une autre police avant de changer. Trois causes étaient possibles.

- Le fichier de police n'est pas préchargé, donc la requête ne démarre qu'après l'analyse du document
- Les métriques de la police de repli diffèrent de la vraie police, ce qui provoque un décalage de mise en page au moment du remplacement
- Un caractère absent du sous-ensemble est demandé plus tard dans un fichier séparé

Les trois se ressemblent au niveau des symptômes — impossible de les distinguer à l'œil nu. Il faut regarder l'heure de départ de la requête de police avec la valeur de `font-display` dans l'onglet Réseau pour savoir de laquelle il s'agit.

## Vérifier le comportement réel

En ouvrant directement les fichiers de build, on voit que les styles générés déclarent un repli pour la correction des métriques, à côté de la vraie police.

```css
@font-face {
  font-family: "Geist Fallback";
  src: local("Helvetica Neue");
  ascent-override: 95.9%;
  descent-override: 24.2%;
  size-adjust: 104.1%;
}
```

![Écran montrant l'heure de départ d'une requête de police dans l'onglet Réseau](/life/travel/travel-05.jpg)

### Étapes de mesure

1. Ouvrir le premier écran avec un cache vide
2. Comparer l'heure de départ de la requête de police avec la fin de l'analyse du document
3. Répéter les mêmes étapes avec une connexion réseau ralentie

> Décider de la cause sans mesurer laisse derrière soi un changement qui a seulement l'air d'être une correction. Un symptôme qui disparaît et une cause qui disparaît, ce n'est pas la même chose.

| Élément | Avec préchargement | Sans préchargement |
| --- | --- | --- |
| Départ de la requête | Avant l'analyse | Après l'analyse |
| Décalage de mise en page | Aucun | Présent |

## Ce qui reste

Une police variable peut couvrir toute la plage de graisses avec un seul fichier, mais la taille du fichier augmente. Savoir quel côté l'emporte dépend du nombre de graisses réellement utilisées, donc il faut le remesurer pour chaque projet. Le contexte est détaillé dans la [documentation font-display de MDN](https://developer.mozilla.org/docs/Web/CSS/@font-face/font-display).
