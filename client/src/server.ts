import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Sert les fichiers statiques depuis le dossier /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Gère toutes les autres requêtes en rendant l'application Angular.
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Lance le serveur si ce module est le point d'entrée principal.
 * Le serveur écoute sur le port défini par la variable d'environnement `PORT`, sinon utilise 4000 par défaut.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Serveur Node Express à l'écoute sur http://localhost:${port}`);
  });
}

/**
 * Gestionnaire de requêtes utilisé par Angular CLI (pour le dev-server et lors du build) ou Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
