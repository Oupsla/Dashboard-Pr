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
Quand une Pull Request est envoyé sur un dépot, il est possible pour un des intégrateurs d'assigner un intégrateur à la révision de celle-ci (voir de se l'assigner à lui-même).
Malheureusement cette étape est assez fastidieuse dans Github et ne donne pas une vision d'ensemble.


Voici l'ensemble des points qui provoque un rempart à l'utilisation des assignations :
- Il faut aller jusqu'à la page de la pull request pour obtenir le menu d'assignation (3-4 clics)
- Le menu d'assignation est peu visible
- Le tableau permettant de lister toutes ces assignations en tant qu'intégrateur est assez "caché"
- Une vue générale des assignations n'est pas disponible pour l'administrateur
- Pour pouvoir assigner une Pull Request, il faut d'abord que l'administrateur connaisse le type de la Pull Request mais aussi les préférences de ces intégrateurs.


### Solution
Notre solution est donc d'améliorer le système d'assignation de Github en proposant un tableau de bord pour "l'administrateur" du dépot.
Celui-ci se composera de 3 écrans :
- Un permettant de sélectionner le dépot à gérer
- Un permettant de gérer les intégrateurs
    - Assigner un type de préférence et une note pour chaque intégrateur
- Un permettant de gérer les assignations
    - Pré-sélectionner automatiquement un intégrateur pour chaque Pull Request
    - Assigner un intégrateur
    - Déassigner un intégrateur



## Travail technique
### But
Le travail technique n'est pas un but en lui-même, c'est plutot le résultat et son utilisation qui nous intéresse dans ce projet.


### Architecture

Pour ce projet, nous avons utilisé Meteor (https://www.meteor.com/) qui est un framework open-source de développement web en JavaScript basé sur Node.js. Nous l'avons couplé à AngularJs pour la partie cliente.

![Architecture](https://raw.githubusercontent.com/Oupsla/Dashboard-Pr/master/public/images/System.png)

Librairies :
- Async https://github.com/caolan/async
- Node-github https://github.com/mikedeboer/node-github
- request https://github.com/request/request
- follow-redirects https://github.com/olalonde/follow-redirects


Concerneant la répartition en dossiers :

![Découpage](https://raw.githubusercontent.com/Oupsla/Dashboard-Pr/master/public/images/FileSystem.png)

- model : collections Meteor (stockées en DB)
- public : dossier servi publiquement au client Angular
- packages et node_modules : librairies node
- client : découpe en pages, chaque page à son propre controlleur et sa propre page qui sera injecté dans index.html
    - github : sélection d'un repo à gérer
    - intégrateurs : gestion des intégrateurs du répo selectionné
    - assignations : gestion des pull requets du répo selectionné (assignation et désassignation)
- server
    - app.js : partie serveur s'occupant entre autre de contacter l'api Github

### Algorithme

Le seul algorithme important de notre système à décrire est celui qui pré-sélectionne les intégrateurs par rapport aux Pull Requests qui ne sont pas encore assignées.

Le principe consiste a récupérer tous les fichiers modifiés par la Pull Request et de comparer ceux-ci à une base de mot-clef relatifs au type d'intégration possible (Test, Front, Back, Doc, Other).
Et ensuite d'assigner les Pull Requests à un intégrateur qui soit est idéal pour ce type de Pull Request soit qui possède le moins d'assignation.

```javascript
//Try to determine a type for each pull request
for pullRequest in pullRequestToAssign
    files = http.get(pullRequest.urlFiles)
    if (files.contains(keywordFront))
        pullRequest.type = "Front"
    else if (files.contains(keywordBack))
        pullRequest.type = "Back"
    (...)
end for

//Assign integrator
for pullRequest in pullRequestToAssign
    integra = integrators.compare(integra1, integra2)
        if(integra1.type == integra2.type)
            return min(integra1.number, integra2.number
        if(integra1.type == pullRequest.type)
            return integra1
        if(integra2.type == pullRequest.type)
            return integra2
        return min(integra1.number, integra2.number
    end compare

    pullRequest.assigned = integra
end for
```

### Utilisation
Lancement :
- meteor npm install
- ROOT_URL=http://ipserveur meteor (example : ROOT_URL=http://91.121.181.105:3000 meteor)

![Integrateurs](https://raw.githubusercontent.com/Oupsla/Dashboard-Pr/master/public/images/Integrateurs.png)

![Assignations](https://raw.githubusercontent.com/Oupsla/Dashboard-Pr/master/public/images/Assignations.png)

![Selection](https://raw.githubusercontent.com/Oupsla/Dashboard-Pr/master/public/images/Selection.png)


## Evaluation
TODO

## Limitation

Pour les petits projets avec peu d’intégrateurs ou peu de Pull Request, l’utilisation de DashboardPr peut être un peu « Overkill ». Son utilité est plus justifiée sur projet de plus grande envergure.
C’est dommage que GitHub n’ait pas mieux pensé son système d’assignation, car si c’était mieux fait, l’existence de DashboardPr, n’aurait pas lieu d’être.

Tout n'est pas non plus possible grâce à l'api Github, il nous ait par exemple difficile de calculer le nombre de Pull Request qu'un intégrateur a accepté ou refusé.
Cela commence à être possible grâce à une nouvelle partie de l'API sur les évènements d'un dépot, mais il faut donc pour cela les obtenir tous et puis les traiter afin d'en tirer des statistiques. On se retrouve très vite dans le domaine du big data.


## Conclusion

Grâce à sa facilité d’utilisation et de prise en main, Dashboard-Pr permet de répondre parfaitement au problème exposé. Les tâches d’assignation que l'administrateur doit effectuer est rendue plus complète, rapide et agréable à utiliser. Cela est mis en œuvre en lui permettant d’avoir une vue d’ensemble des assignations, d’accéder plus rapidement à l’information ou la modification qu’il recherche.

Pour conclure, Dashboard-Pr offre une solution efficace en ce qui concerne les assignations. Il pourrait être intéressant d’imaginer intégrer certaines fonctionnalités directement dans GitHub ou dans une application de gestion de tâche d'administrateur afin d’éviter de devoir passer par une application tierce uniquement pour gérer les assignations.


Au passage, nous avons résolu une erreur dans le plugin 'node-github' (lien : https://github.com/mikedeboer/node-github/issues/431)

## Glossaire
- Intégrateur : Personne ayant la permission de fusion sur un dépôt
- Administrateur : Personne ayant les permissions totales sur un dépôt et qui est responsable du projet et assignations
