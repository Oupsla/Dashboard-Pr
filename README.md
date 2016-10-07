# OPL - Thème 1: Pull Request Engineering
11/10/2016
Denis Hamann - Nicolas Delperdange

## Introduction
Dans le but d'améliorer les Pull Requests de Github, nous avons concentré notre travail sur le système d'assignation.


### Contexte/Problème
Quand une Pull Request est envoyé sur un dépot, il est possible pour un des intégrateurs d'assigner un intégrateur à la révision de celle-ci (voir de se l'assigner à lui même).
Malheureusement cette étape est assez fastidieuse dans Github et ne donne pas une vision d'ensemble.


Voici l'ensemble des points qui provoque un rempart à l'utilisation des assignations :
- Il faut aller jusqu'à la page de la pull request pour obtenir le menu d'assignation (3-4 clics)
- Le menu d'assignation est peu visible
- Le tableau permettant de lister toutes ces assignations en tant qu'intégrateur est assez "caché"
- Une vue générale des assignations n'est pas disponible pour l'administrateur


### Solution
Notre solution est donc d'améliorer le système d'assignation de Github en proposant un tableau de bord pour "l'administrateur" du dépot.
Celui-ci se composera de 3 écrans :
- Un permettant de sélectionner le dépot à gérer
- Un permettant de gérer les intégrateurs
- Un permettant de gérer les assignations



## Travail technique
### But
Le travail technique n'est pas un but en lui-même, c'est plutot le résultat et son utilisation qui nous intéresse dans ce projet.
### Algorithme
TODO
### Architecture (langage, librairies utilisées, modules et classes)
Client : AngularJs
Serveur : NodeJs
Framework : Meteor

Librairies :
- Async https://github.com/caolan/async
- Node-github https://github.com/mikedeboer/node-github

TODO (modules et classes)

### Implémentation (code/patterns/idioms élégants ou efficaces, taille)
TODO
### Utilisation (screenshots, etc)
- meteor npm install
- ROOT_URL=http://ipserveur meteor (example : ROOT_URL=http://91.121.181.105:3000 meteor)
TODO (screenshots, etc)

## Evaluation
TODO

## Limitation
TODO

## Conclusion
TODO

## Glossaire
- Intégrateur : Personne ayant la permission de fusion sur un dépôt
- Administrateur : Personne ayant les permissions totales sur un dépôt
