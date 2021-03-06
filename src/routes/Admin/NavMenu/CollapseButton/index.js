import React from 'react';
import { cx } from 'emotion';
import { buttonClass, collapsedButtonClass, buttonIconClass, buttonLabelClass } from './styled';

/* eslint-disable react/prop-types,react/button-has-type */

function CollapseButton({ isCollapsed, ...rest }) {
  return (
    <button
      {...rest}
      className={cx(buttonClass, {
        [collapsedButtonClass]: isCollapsed,
      })}
      aria-expanded={!isCollapsed}
      aria-label={isCollapsed ? 'Expand menu' : 'Collapse menu'}
    >
      <i className={buttonIconClass} />
      {!isCollapsed && <i className={buttonLabelClass}>Collapse menu</i>}
    </button>
  );
}

export default CollapseButton;
