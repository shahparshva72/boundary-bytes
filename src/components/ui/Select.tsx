'use client';

import dynamic from 'next/dynamic';
import { neoBrutalistStyles } from './selectStyles';

const ReactSelect = dynamic(() => import('react-select'), { ssr: false });

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: SelectOption | null;
  onChange: (newValue: SelectOption | null) => void;
  placeholder?: string;
  isSearchable?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
  id?: string;
  instanceId?: string;
}

function Select({
  options,
  value,
  onChange,
  placeholder,
  isSearchable = true,
  isClearable = false,
  isDisabled = false,
  isLoading = false,
  className = '',
  id,
  instanceId,
}: SelectProps) {
  const handleChange = (newValue: unknown) => {
    onChange(newValue as SelectOption | null);
  };

  return (
    <div className={className}>
      <ReactSelect
        options={options}
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
      />
    </div>
  );
}

export { Select };
export type { SelectProps };
