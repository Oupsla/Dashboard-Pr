# OPL - Thème 1: Pull Request Engineering
11/10/2016

Denis Hamann - Nicolas Delperdange

## Table des matières
**[Introduction](#introduction)**  
**[Travail technique](#travail-technique)**  
**[Evaluation](#evaluation)**  
**[Limitation](#limitation)**  
**[Conclusion](#conclusion)**  
**[Glossaire](#glossaire)**

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

![Architecture](https://raw.githubusercontent.com/Oupsla/Dashboard-Pr/master/public/images/System.png)

Librairies :
- Async https://github.com/caolan/async
- Node-github https://github.com/mikedeboer/node-github
- request https://github.com/request/request
- follow-redirects https://github.com/olalonde/follow-redirects

![Découpage](https://raw.githubusercontent.com/Oupsla/Dashboard-Pr/master/public/images/FileSystem.png)

Modules et classes :
- model : collections Meteor (stockées en DB)
- public : dossier servi publiquement au client Angular
- packages et node_modules : librairies node
- client : découpe en pages, chaque page à son propre controlleur et sa propre page qui sera injecté dans index.html
    - github : sélection d'un repo à gérer
    - intégrateurs : gestion des intégrateurs du répo selectionné
    - assignations : gestion des pull requets du répo selectionné (assignation et désassignation)
- server
    - app.js : partie serveur s'occupant entre autre de contacter l'api Github

### Implémentation
TODO  (code/patterns/idioms élégants ou efficaces, taille)
### Utilisation
Lancement :
- meteor npm install
- ROOT_URL=http://ipserveur meteor (example : ROOT_URL=http://91.121.181.105:3000 meteor)

TODO (screenshots, etc)

## Evaluation
TODO

## Limitation

Pour les petits projets avec peu d’intégrateurs ou peu de Pull Request, l’utilisation de DashboardPr peut être un peu « Overkill ». Son utilité est plus justifiée sur projet de plus grande envergure.
C’est dommage que GitHub n’ait pas mieux pensé son système d’assignation, car si c’était mieux fait, l’existence de DashboardPr, n’aurait pas lieu d’être.


## Conclusion

Grâce à sa facilité d’utilisation et de prise en main, Dashboard-Pr permet de répondre parfaitement au problème exposé. Les tâches d’assignation que le « chef » doit effectuer est rendue plus complète, rapide et agréable à utiliser. Cela est mis en œuvre en lui permettant d’avoir une vue d’ensemble des assignations, d’accéder plus rapidement à l’information ou la modification qu’il recherche. Pour conclure, Dashboard-Pr offre une solution efficace en ce qui concerne les assignations. Il pourrait être intéressant d’imaginer intégrer certaines fonctionnalités directement dans GitHub ou dans une application de gestion de tâche de « chef » afin d’éviter de devoir passer par une application tierce uniquement pour gérer les assignations.


Au passage, nous avons résolu une erreur dans le plugin 'node-github' (lien : https://github.com/mikedeboer/node-github/issues/431)

## Glossaire
- Intégrateur : Personne ayant la permission de fusion sur un dépôt
- Administrateur : Personne ayant les permissions totales sur un dépôt
