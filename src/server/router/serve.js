import { renderToString } from 'react-dom/server';
import { extractCritical } from 'emotion-server';
import { getDataFromTree } from 'react-apollo';
import { getLoadableBundles } from 'kyt-runtime/server';
// eslint-disable-next-line
import template from 'server/template';
import injectStyles from 'styles/inject';

export default async (req, res) => {
  const {
    app,
    client,
    stylesheets = [],
    mainJSBundle,
    runtimeJSBundle,
    modules = [],
    clientAssets,
  } = res.locals;

  try {
    injectStyles();

    await getDataFromTree(app);
  } catch (e) {
    // eslint-disable-next-line
    console.log(e);
  }

  const state = client.cache.extract();

  res.status(200);

  const { html, ids, css } = extractCritical(renderToString(app));

  const bundles = getLoadableBundles(modules);
  bundles.scripts = bundles.scripts.filter(
    b => ![clientAssets['main.js'], clientAssets['admin.js'], clientAssets['login.js']].includes(b)
  );

  const response = template({
    html,
    ids,
    css,
    helmet: res.locals.helmetContext.helmet,
    stylesheets,
    state,
    mainJSBundle,
    runtimeJSBundle,
    clientAssets,
    bundles,
  });

  res.send(response);
};
