import React from 'react';
import gql from 'graphql-tag';
import Editor from 'components/Editor';
import Form from 'components/Form';
import FeaturedMedia from 'components/Form/FeaturedMedia';
import Tags from './Tags';
import { postTitleClass, ViewPost } from './styled';

/* eslint-disable react/prop-types */

const postFields = [
  {
    prop: 'slug',
    render: post => {
      if (!post.slug) {
        return null;
      }

      const url = `/post/${post.slug}`;
      return (
        <ViewPost href={url} target="_blank">
          View Post
        </ViewPost>
      );
    },
    position: 'info',
  },
  {
    prop: 'title',
    editable: true,
    className: postTitleClass,
    placeholder: 'Add a Title',
  },
  {
    prop: 'contentState',
    type: 'editor',
    editable: true,
    placeholder: 'Post goes here...',
  },
  post => {
    let featuredMedia = post.featuredMedia ? post.featuredMedia.map(media => media.id) : [];
    const onChange = value => {
      featuredMedia = value;
    };
    return {
      label: 'Featured Media',
      prop: 'featuredMedia',
      type: 'custom',
      editable: true,
      value: () => featuredMedia,
      render: p => <FeaturedMedia onChange={onChange} media={p.featuredMedia} />,
      position: 'meta',
    };
  },
  {
    label: 'Summary',
    prop: 'summary',
    type: 'textarea',
    editable: true,
    position: 'meta',
  },
  post => {
    let tags = post.artists ? post.artists.map(t => t.name) : [];
    const onChange = value => {
      tags = value;
    };
    return {
      label: 'Artists',
      prop: 'artists',
      type: 'custom',
      value: () => tags,
      editable: true,
      position: 'meta',
      render: ({ artists = [] }) => <Tags tags={artists.map(t => t.name)} onChange={onChange} />,
    };
  },
  {
    label: 'Publish Date',
    prop: 'date',
    type: 'date',
    editable: true,
    position: 'info',
  },
  {
    label: 'Status',
    prop: 'status',
    type: 'select',
    editable: true,
    choices: [{ label: 'Publish', value: 'PUBLISH' }, { label: 'Draft', value: 'DRAFT' }],
    position: 'info',
  },
];

export default function PostForm({ post = {}, buttonLabel = 'Submit', onSubmit }) {
  return <Form fields={postFields} data={post} {...{ buttonLabel, onSubmit }} />;
}

PostForm.fragments = {
  post: gql`
    fragment PostForm_post on Post {
      id
      title
      slug
      contentState {
        ...Editor_contentState
      }
      summary
      status
      featuredMedia {
        ...FeaturedMedia_media
      }
      artists {
        name
      }
      date
    }
    ${Editor.fragments.contentState}
    ${FeaturedMedia.fragments.media}
  `,
};
