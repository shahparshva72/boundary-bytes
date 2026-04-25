import type { CSSObjectWithLabel } from 'react-select';

const neoBrutalistStyles = {
  control: (provided: CSSObjectWithLabel, state: { isFocused: boolean }) => ({
    ...provided,
    border: '2px solid black',
    borderRadius: 0,
    padding: '0.1rem',
    boxShadow: state.isFocused ? '2px 2px 0px 0px rgba(0,0,0,1)' : 'none',
    fontSize: '14px',
    minHeight: '32px',
    backgroundColor: 'white',
    '&:hover': {
      borderColor: 'black',
    },
    '@media (min-width: 640px)': {
      border: '2px solid black',
      padding: '0.15rem',
      fontSize: '16px',
      minHeight: '36px',
    },
  }),
  option: (provided: CSSObjectWithLabel, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#FF5E5B' : state.isFocused ? '#FFED66' : 'white',
    color: 'black',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    '@media (min-width: 640px)': {
      fontSize: '16px',
    },
  }),
  menu: (provided: CSSObjectWithLabel) => ({
    ...provided,
    border: '2px solid black',
    borderRadius: 0,
    boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)',
    marginTop: '4px',
    '@media (min-width: 640px)': {
      border: '2px solid black',
    },
  }),
  menuList: (provided: CSSObjectWithLabel) => ({
    ...provided,
    padding: 0,
  }),
  menuPortal: (provided: CSSObjectWithLabel) => ({
    ...provided,
    zIndex: 9999,
  }),
  singleValue: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: 'black',
    fontWeight: 'bold',
  }),
  placeholder: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: '#6b7280',
  }),
  input: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: 'black',
  }),
  indicatorSeparator: () => ({
    display: 'none' as const,
  }),
  dropdownIndicator: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: 'black',
    '&:hover': {
      color: 'black',
    },
  }),
  clearIndicator: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: 'black',
    '&:hover': {
      color: '#FF5E5B',
    },
  }),
  multiValue: (provided: CSSObjectWithLabel) => ({
    ...provided,
    backgroundColor: '#00CECB',
    border: '2px solid black',
    borderRadius: 0,
  }),
  multiValueLabel: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: 'black',
    fontWeight: 'bold',
    fontSize: '12px',
    '@media (min-width: 640px)': {
      fontSize: '14px',
    },
  }),
  multiValueRemove: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: 'black',
    '&:hover': {
      backgroundColor: '#FF5E5B',
      color: 'black',
    },
  }),
};

export { neoBrutalistStyles };
