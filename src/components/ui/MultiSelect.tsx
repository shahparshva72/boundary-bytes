'use client';

import dynamic from 'next/dynamic';
import { neoBrutalistStyles } from './selectStyles';

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
    const selected = Array.isArray(newValue) ? (newValue as SelectOption[]) : [];
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
        menuPortalTarget={typeof window !== 'undefined' ? document.body : undefined}
        menuPosition="fixed"
        noOptionsMessage={() => (isMaxReached ? `Max ${maxSelections} selections` : 'No options')}
        closeMenuOnSelect={false}
      />
    </div>
  );
}

export { MultiSelect };
export type { MultiSelectProps, SelectOption };
