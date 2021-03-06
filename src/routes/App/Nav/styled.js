import { css } from 'emotion';
import themeUtils from 'styles/theme';
import responsive from 'styles/responsive';

export const navClass = css`
  display: flex;
  justify-content: space-between;
  margin: ${themeUtils.padding}px 0;

  ${responsive.tablet} {
    justify-content: flex-start;
    margin: ${themeUtils.padding}px auto;
    text-align: center;
    width: 640px;
  }

  ${responsive.desktop} {
    margin: ${themeUtils.padding}px 0;
    text-align: left;
    width: auto;
  }
`;

export const navItemClass = css`
  color: ${themeUtils.colors.dark};
  font-family: ${themeUtils.fonts.futura};
  font-size: 18px;
  font-weight: ${themeUtils.fonts.weight.bold};
  line-height: 28px;
  text-decoration: none;
  text-transform: uppercase;
  vertical-align: middle;

  &.active {
    color: ${themeUtils.colors.pink};
  }

  ${responsive.tablet} {
    font-size: 24px;
    margin: 0 20px 0 0;
  }
`;
