import { css } from 'emotion';
import themeUtils from 'styles/theme';
import { h1styles } from 'styles/utils';

export const wrapperClass = css`
  width: 640px;
  max-width: 100%;
`;

export const titleClass = css`
  ${h1styles};
  color: ${themeUtils.colors.dark};
`;

export const textClass = css`
  margin-bottom: 24px;
`;

export const figureClass = css`
  margin-bottom: 24px;
`;

export const figcaptionClass = css`
  margin-bottom: 12px;
`;

export const linkClass = css`
  color: ${themeUtils.colors.pink};
`;

export const footerClass = css`
  display: flex;
  margin: 40px 0 0;
`;

export const logoClass = css`
  margin: 0 10px 0 0;
`;

export const appleClass = css`
  height: 50px;
  width: auto;
`;

export const googleClass = css`
  height: 50px;
  width: auto;
`;

export const spotifyClass = css`
  height: 50px;
  width: auto;
`;
