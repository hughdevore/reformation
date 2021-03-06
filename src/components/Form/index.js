// @flow
import React, { Component } from 'react';
import { convertToRaw } from 'draft-js';
import type { ContentState } from 'draft-js';
import { cx } from 'emotion';
import invariant from 'invariant';
import Editor from 'components/Editor';
import { PrimaryButton } from 'styles/utils';
import InfoColumn from './InfoColumn';
import Input from './Input';
import Textarea from './Textarea';
import Select, { type Choices } from './Select';
import Date from './Date';
import * as styles from './styled';

const { FieldName, FieldValue } = styles;

type Data = {};
type Updates = {};
type F = {
  prop: string,
  value?: () => any,
  defaultValue?: any,
  render?: (?Data) => any,
  className?: string | null,
  label?: string,
  type?: string,
  placeholder?: string,
  choices?: Choices,
  inputType?: string,
  editable?: boolean,
  multiple?: boolean,
  condition?: Data => boolean,
};

type Props = {
  data: Data,
  fields: Array<F>,
  boxLabel?: string,
  buttonLabel?: string,
  onSubmit: (Event, Updates) => void,
};

type RawContent = {
  blocks: Array<{}>,
  entityMap: any,
};

export default class Form extends Component<Props> {
  boundRefs = {};

  fields = {};

  bindRef = (prop: string) => (ref: HTMLElement) => {
    this.boundRefs[prop] = ref;
  };

  onSubmit = (e: Event & { target: HTMLButtonElement }) => {
    e.preventDefault();
    // $FlowFixMe
    e.target.blur();

    const { onSubmit } = this.props;
    const fields = Object.keys(this.fields).map(key => this.fields[key]);

    const updates = fields.reduce((memo, field) => {
      if (field.editable && (!field.condition || field.condition(this.props.data))) {
        const prop = this.boundRefs[field.prop];
        if (!prop) {
          invariant(field.value, 'Custom editable fields must provide a value() method.');
          // eslint-disable-next-line no-param-reassign
          memo[field.prop] = field.value();
        } else if (field.type === 'select' && field.multiple) {
          // eslint-disable-next-line no-param-reassign
          memo[field.prop] = [...prop.selectedOptions].map(o => o.value);
        } else {
          // eslint-disable-next-line no-param-reassign
          memo[field.prop] = prop.value;
        }
      }
      return memo;
    }, {});

    onSubmit(e, updates);
  };

  bindOnChange = (field: F, data: Data) => {
    let initialValue = data[field.prop];

    // eslint-disable-next-line no-param-reassign
    field.value = () => initialValue;

    return (value: string) => {
      initialValue = value;
    };
  };

  editorOnChange = (field: F) => (content: ContentState) => {
    const converted = convertToRaw(content);
    const value: RawContent = {
      blocks: [...converted.blocks],
      entityMap: { ...converted.entityMap },
    };
    const entityMap = Object.keys(value.entityMap).map(i => {
      const entity = { ...value.entityMap[i] };
      const entityData = { type: entity.type };
      if (entityData.type === 'LINK') {
        ['href', 'target'].forEach(key => {
          entityData[key] = entity.data[key] || '';
        });
      } else if (entityData.type === 'EMBED') {
        ['url', 'html'].forEach(key => {
          entityData[key] = entity.data[key] || '';
        });
      } else if (entityData.type === 'IMAGE') {
        ['imageId', 'size'].forEach(key => {
          entityData[key] = entity.data[key] || '';
        });
      } else if (entityData.type === 'VIDEO') {
        ['videoId'].forEach(key => {
          entityData[key] = entity.data[key] || '';
        });
      }
      return {
        ...entity,
        data: entityData,
      };
    });
    value.entityMap = entityMap;
    this.boundRefs[field.prop] = {
      value,
    };
  };

  editableField(field: F, data: Data = {}) {
    if (field.type === 'editor') {
      return (
        <Editor
          className={cx(field.className)}
          onChange={this.editorOnChange(field)}
          editorKey={field.prop}
          content={data && field.render ? field.render(data) : data[field.prop]}
          placeholder={field.placeholder || 'Content goes here...'}
        />
      );
    }

    if (field.type === 'date') {
      return (
        <Date
          date={parseInt(data[field.prop] || field.defaultValue, 10)}
          onChange={this.bindOnChange(field, data)}
        />
      );
    }

    if (field.type === 'select') {
      return (
        <Select
          className={field.className}
          bindRef={this.bindRef(field.prop)}
          choices={field.choices}
          value={data[field.prop] || (field.multiple ? [] : '')}
          multiple={field.multiple || false}
          placeholder={field.placeholder || ''}
        >
          {data && field.render ? field.render(data) : null}
        </Select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <Textarea
          className={field.className}
          bindRef={this.bindRef(field.prop)}
          value={data && field.render ? field.render(data) : data[field.prop]}
        />
      );
    }

    return (
      <Input
        placeholder={field.placeholder || ''}
        type={field.inputType || 'text'}
        className={field.className}
        bindRef={this.bindRef(field.prop)}
        value={data && field.render ? field.render(data) : data[field.prop]}
      />
    );
  }

  render() {
    const { data = {}, fields, boxLabel, buttonLabel } = this.props;

    const primaryFields = [];
    const infoFields = [];
    const metaFields = [];

    fields.forEach((f, i) => {
      const field = typeof f === 'function' ? f(data) : f;
      if (field.condition && !field.condition(data)) {
        return;
      }

      const key = field.prop || i.toString(16);
      this.fields[key] = field;

      let formField;
      if (field.type === 'custom') {
        invariant(
          field.render,
          'You must specify a render property for a custom field: %s',
          field.prop
        );
        formField = (
          <div key={key} className={styles.wrapClass}>
            {field.label && <FieldName>{field.label}</FieldName>}
            {field.render(data)}
          </div>
        );
      } else if (field.type === 'date' || field.type === 'editor') {
        formField = (
          <div key={key} className={styles.wrapClass}>
            {field.label && <FieldName>{field.label}</FieldName>}
            {this.editableField(field, data)}
          </div>
        );
      } else {
        formField = (
          <p key={key} className={styles.fieldClass}>
            {field.label && <FieldName>{field.label}</FieldName>}
            {field.editable ? (
              this.editableField(field, data)
            ) : (
              <FieldValue>{(field.render && field.render(data)) || data[field.prop]}</FieldValue>
            )}
          </p>
        );
      }

      if (field.position === 'info') {
        infoFields.push(formField);
      } else if (field.position === 'meta') {
        metaFields.push(formField);
      } else {
        primaryFields.push(formField);
      }
    });

    const button = <PrimaryButton onClick={this.onSubmit}>{buttonLabel}</PrimaryButton>;

    return (
      <form className={styles.formClass}>
        <fieldset className={styles.fieldsClass}>
          <div className={styles.mainColumnClass}>
            {primaryFields}
            {infoFields.length === 0 ? button : null}
          </div>
          <InfoColumn {...{ infoFields, metaFields, label: boxLabel, button }} />
        </fieldset>
      </form>
    );
  }
}

Form.defaultProps = {
  boxLabel: 'Details',
  buttonLabel: 'Submit',
};
