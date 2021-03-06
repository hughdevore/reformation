// @flow
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import fetch from 'isomorphic-fetch';
import fragmentMatcher from './fragmentMatcher';
import errorLink from './error';

type ClientOps = {
  uri: string,
  authToken?: string,
  ssrMode?: boolean,
};

export default function client({ uri, authToken = null, ssrMode = false }: ClientOps) {
  const headers = {};
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let cache = new InMemoryCache({ fragmentMatcher });
  if (!ssrMode) {
    cache = cache.restore(window.__APOLLO_STATE__);
  }

  return new ApolloClient({
    link: ApolloLink.from([
      errorLink,
      new HttpLink({
        uri,
        fetch,
        headers,
      }),
    ]),
    cache,
    ssrMode,
  });
}
