import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';
import Loading from 'components/Loading';
import ListTable, { renderThumbnail } from 'components/ListTable';
import { rowActionsClass, rowTitleClass, thumbnailColumnClass } from 'components/ListTable/styled';
import { offsetToCursor } from 'utils/connection';
import { Heading, HeaderAdd } from 'routes/Admin/styled';
import TermQuery from './TermQuery.graphql';

/* eslint-disable react/prop-types */

const PER_PAGE = 20;

@compose(
  graphql(TermQuery, {
    options: ({ match }) => {
      const { params } = match;

      const variables = { first: PER_PAGE, taxonomyId: params.taxonomyId };
      if (params.page) {
        const pageOffset = parseInt(params.page, 10) - 1;
        if (pageOffset > 0) {
          variables.after = offsetToCursor(pageOffset * PER_PAGE - 1);
        }
      }

      return {
        // This ensures that the table is up to date when taxonomies are mutated.
        // The alternative is to specify refetchQueries on all Taxonomy mutations.
        variables,
        fetchPolicy: 'cache-and-network',
      };
    },
  }),
  graphql(gql`
    mutation DeleteTermMutation($ids: [ObjID]!) {
      removeTerm(ids: $ids)
    }
  `)
)
class Terms extends Component {
  render() {
    const {
      location,
      match,
      mutate,
      data: { variables, loading, terms },
    } = this.props;

    if (loading && !terms) {
      return <Loading />;
    }

    let columns = [
      {
        className: thumbnailColumnClass,
        render: term => {
          if (
            term.featuredMedia &&
            term.featuredMedia[0] &&
            term.featuredMedia[0].type === 'image'
          ) {
            return renderThumbnail(term.featuredMedia[0], 'crops');
          }

          return null;
        },
      },
      {
        label: 'Name',
        render: term => {
          const onClick = e => {
            e.preventDefault();

            mutate({
              refetchQueries: [{ query: TermQuery, variables }],
              variables: {
                ids: [term.id],
              },
            });
          };

          const urlPath = `/terms/${term.taxonomy.id}/${term.id}`;

          return (
            <>
              <strong className={rowTitleClass}>
                <Link to={urlPath}>{term.name}</Link>
              </strong>
              <nav className={rowActionsClass}>
                <Link to={urlPath}>Edit</Link> |{' '}
                <a className="delete" onClick={onClick} href={urlPath}>
                  Delete
                </a>
              </nav>
            </>
          );
        },
      },
      {
        label: 'Slug',
        prop: 'slug',
      },
    ];

    if (terms.taxonomy.slug === 'venue') {
      columns = columns.concat([
        {
          label: 'Capacity',
          prop: 'capacity',
        },
        {
          label: 'Address',
          prop: 'address',
        },
      ]);
    }

    return (
      <>
        <Heading>{terms.taxonomy.plural}</Heading>
        <HeaderAdd to={`/terms/${terms.taxonomy.id}/add`}>Add {terms.taxonomy.name}</HeaderAdd>
        <ListTable
          {...{ location, match, columns, mutate, variables }}
          data={terms}
          path={`/terms/${terms.taxonomy.id}`}
        />
      </>
    );
  }
}

export default Terms;
