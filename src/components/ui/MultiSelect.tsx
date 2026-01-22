'use client';

import dynamic from 'next/dynamic';
import type { CSSObjectWithLabel } from 'react-select';

const ReactSelect = dynamic(() => import('react-select'), { ssr: false });

interface SelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: SelectOption[];
  value: SelectOption[];
  onChange: (newValue: SelectOption[]) => void;
  placeholder?: string;
  isSearchable?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
  id?: string;
  instanceId?: string;
  maxSelections?: number;
}

const neoBrutalistStyles = {
  control: (provided: CSSObjectWithLabel, state: { isFocused: boolean }) => ({
    ...provided,
    border: '2px solid black',
    borderRadius: 0,
    padding: '0.125rem',
    boxShadow: state.isFocused ? '4px 4px 0px 0px rgba(0,0,0,1)' : 'none',
    fontSize: '14px',
    minHeight: '40px',
    backgroundColor: 'white',
    '&:hover': {
      borderColor: 'black',
    },
    '@media (min-width: 640px)': {
      border: '4px solid black',
      padding: '0.25rem',
      fontSize: '16px',
      minHeight: '48px',
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
    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
    marginTop: '4px',
    '@media (min-width: 640px)': {
      border: '4px solid black',
    },
  }),
  menuList: (provided: CSSObjectWithLabel) => ({
    ...provided,
    padding: 0,
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
};

function MultiSelect({
  options,
  value,
  onChange,
  placeholder,
  isSearchable = true,
  isClearable = true,
  isDisabled = false,
  isLoading = false,
  className = '',
  id,
  instanceId,
  maxSelections = 5,
}: MultiSelectProps) {
  const handleChange = (newValue: unknown) => {
    const selected = (newValue as SelectOption[]) || [];
    if (selected.length <= maxSelections) {
      onChange(selected);
    }
  };

  const isMaxReached = value.length >= maxSelections;

  return (
    <div className={className}>
      <ReactSelect
        isMulti
        options={isMaxReached ? [] : options}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        isSearchable={isSearchable}
        isClearable={isClearable}
        isDisabled={isDisabled}
        isLoading={isLoading}
        id={id}
        instanceId={instanceId}
        styles={neoBrutalistStyles}
        noOptionsMessage={() => (isMaxReached ? `Max ${maxSelections} players` : 'No options')}
        closeMenuOnSelect={false}
      />
    </div>
  );
}

export { MultiSelect };
export type { MultiSelectProps, SelectOption };
