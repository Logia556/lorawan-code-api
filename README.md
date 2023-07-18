# lorawan-codec-api

## utilisation

<p>actuellement, les fichier executables sont dans le dossier captors. <br>
ils contiennent les paramettres batch spécifique au capteur associé, et devront aussi contenir un tableau de cluster pour la sortie standard dans le futur. </p>

<p>de ce fait il vaut mieux utiliser le <strong>0debug.js</strong> si l'on veut tester son fonctionnement pour le moment.<br>
</p>

<p>comme l'explique la spécification TS013-1.0.0, on donne en argument le payload à décoder, avec son port et la date de réception du payload<br>
la commande d'execution est la suivante:</p>

    ./0debug.js <port> <payload> <date>

<p>ici, l'execution est faite en locale, mieux vaut mettre le chemin absolu.</p>

## fonctionnement

<p>on va mettre dans un objet <code>input</code> les paramètres d'entrés, qui seront envoyés à la fonction <code>watteco_decodeUplink()</code></p>

<p>cette fonction va, dans un premier temps traiter le payload comme si c'était un standard, à l'aide la fonction <code>normalisation()</code> de <strong>standard.js</strong>.<br>
Dans le cas d'un payload standard, on modifie le résultat de <code>Decoder()</code> pour retourner les donnés dans un format souhaité.<br>
Si le payload est en fait un batch, on retourne le payload, qui est envoyé dans la fonction <code>normalisation()</code> de <strong>batch.js</strong>.
De même, on modifie le résultat de <code>brUncompress()</code> pour retourner les donnés dans un format souhaité.</p> 

<p> on observe actuellement le résultat dans la console au travers d'un appel stocké puis loggé de la fonction <code>decodeUplink()</code>.</p>

## webpack 

<p>afin de respecter la contrainte d'un seul fichier final pour le codec, on utilise webpack pour compiler les fichiers en un seul.</p>

<p>il faut installer webpack cli comme cela:</p>

    npm install webpack webpack-cli --save-dev

<p>on peut alors écrire notre fichier <strong>webpack.config.js</strong>, et l'exécuter comme ceci:</p>

    npx webpack --config webpack.config.js

<p>il faudra s'ssurer que les dossier spécifiés existes.</p>