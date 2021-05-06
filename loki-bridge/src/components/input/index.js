import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
  FormControl,
  OutlinedInput,
  FormHelperText,
  InputAdornment,
  IconButton
} from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';

import StyledLabel from '../label';
import styles from './styles';

function StyledInput(props) {
  const {
    classes,
    helpertext,
    placeholder,
    id,
    defaultValue,
    label,
    fullWidth,
    value,
    onChange,
    error,
    disabled,
    password,
    type
  } = props;


  const [values, setValues] = React.useState({
    amount: '',
    password: '',
    weight: '',
    weightRange: '',
    showPassword: false,
  });

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const endAdornment = password ? (
    <InputAdornment position="end">
      <IconButton aria-label="Toggle password visibility" onClick={handleClickShowPassword}>
        {values.showPassword ? <Visibility /> : <VisibilityOff />}
      </IconButton>
    </InputAdornment>) :  null;

  return (
    <FormControl className={classes.root} variant="outlined" fullWidth={fullWidth} error={error}>
      <StyledLabel label={ label } />
      <OutlinedInput
        id={ id }
        placeholder={ placeholder }
        fullWidth={ fullWidth }
        defaultValue={ defaultValue }
        labelWidth={ 0 }
        value={ value }
        onChange={ onChange }
        disabled={ disabled }
        type={ password ? values.showPassword ? 'text' : 'password' : type }
        endAdornment={ endAdornment }
      />
      { helpertext && <FormHelperText>{helpertext}</FormHelperText> }
    </FormControl>
  );
}

StyledInput.propTypes = {
  classes: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  helpertext: PropTypes.string,
  placeholder: PropTypes.string,
  id: PropTypes.string,
  defaultValue: PropTypes.string,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
  password: PropTypes.bool,
  type: PropTypes.string
};

export default withStyles(styles)(StyledInput);
