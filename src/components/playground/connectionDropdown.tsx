import { useState, useEffect, useRef } from 'react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { UseFormRegister, UseFormSetValue, RegisterOptions, FieldValues, Path, UseFormWatch, PathValue } from 'react-hook-form';
import { BoltIcon, PhoneIcon } from '@heroicons/react/24/outline';

export interface ConnectionOption {
  id: string;
  name: string;
  description: string;
  email: string;
  type?: string;
  config?: {
    model_name?: string;
    provider?: string;
    model_id?: string;
  };
}

interface CustomSelectProps<T extends FieldValues> {
  options: ConnectionOption[];
  name: Path<T>;
  setValue: UseFormSetValue<T>;
  register: UseFormRegister<T>;
  watch: UseFormWatch<T>;
  validation?: RegisterOptions<T, Path<T>>;
  widthClass?: string;
  placeholder?: string;
  disabled?: boolean;
  showAddNew?: boolean;
  filterByType?: string;
  autoSelectFirst?: boolean;
}

const ConnectionSelect = <T extends FieldValues>({
  options,
  name,
  setValue,
  register,
  watch,
  validation = {},
  widthClass = "w-full",
  placeholder = "Select a connection",
  disabled = false,
  showAddNew = true,
  filterByType,
  autoSelectFirst = true
}: CustomSelectProps<T>) => {

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number>();

  // Filter options by type if specified
  const filteredOptions = filterByType
    ? options.filter(option => option.type === filterByType)
    : options;

  const formValue = watch(name);
  const selectedOption = filteredOptions.find(option => option.id === formValue) || null;

  useEffect(() => {
    const updateWidth = () => {
      if (triggerRef.current) {
        setDropdownWidth(triggerRef.current.getBoundingClientRect().width);
      }
    };

    updateWidth();

    if (typeof ResizeObserver !== 'undefined' && triggerRef.current) {
      const resizeObserver = new ResizeObserver(() => updateWidth());
      resizeObserver.observe(triggerRef.current);
      return () => resizeObserver.disconnect();
    }

    const resizeListener = () => updateWidth();
    window.addEventListener('resize', resizeListener);
    return () => window.removeEventListener('resize', resizeListener);
  }, [widthClass]);

  useEffect(() => {
    register(name, validation);
  }, [register, name, validation]);

  useEffect(() => {
    if (!autoSelectFirst) return;
    if (!formValue && filteredOptions && filteredOptions.length > 0) {
      setValue(name, filteredOptions[0]?.id as PathValue<T, Path<T>>, { shouldValidate: true });
    }
  }, [formValue, filteredOptions, name, setValue, autoSelectFirst]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectOption = (option: ConnectionOption) => {
    setValue(name, option.id as PathValue<T, Path<T>>, { shouldValidate: true, shouldDirty: true });
    setIsOpen(false);
  };

  // Helper function to get connection icon
  const getConnectionIcon = (type?: string) => {
    switch (type) {
      case 'llm':
        return <BoltIcon className="h-4 w-4 text-blue-600" />;
      case 'api':
        return <div className="h-4 w-4 bg-green-100 rounded flex items-center justify-center">
          <span className="text-green-600 text-xs font-bold">API</span>
        </div>;
      case 'twilio':
        return <PhoneIcon className="h-4 w-4 text-indigo-600" />;
      default:
        return <div className="h-4 w-4 bg-gray-100 rounded flex items-center justify-center">
          <span className="text-gray-600 text-xs font-bold">?</span>
        </div>;
    }
  };

  // Helper function to get connection subtitle
  const getConnectionSubtitle = (option: ConnectionOption) => {
    switch (option.type) {
      case 'llm':
        return option.config?.model_name || 'LLM Connection';
      case 'api':
        return option.config?.provider || 'API Connection';
      case 'twilio':
        return 'Twilio Connection';
      default:
        return option.description || 'Connection';
    }
  };

  return (
    <div className="space-y-3 relative" ref={dropdownRef}>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`relative ${widthClass} px-3 py-2 border border-gray-300 rounded-md hover:border-blue-400 bg-white text-left shadow-sm ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {selectedOption ? (
          <span className="flex items-center space-x-2 truncate">
            <div className={`flex-shrink-0 ${selectedOption.type === "llm" ? "bg-blue-100 p-1 rounded" : ""}`}>
              {getConnectionIcon(selectedOption.type)}
            </div>
            <span className="text-sm font-medium text-gray-900 truncate">
              {selectedOption.name}
              <span className="text-xs text-gray-500"> - {getConnectionSubtitle(selectedOption)}</span>
            </span>
          </span>
        ) : (
          <span className="text-gray-500 text-sm">{placeholder}</span>
        )}
        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
          <ChevronUpDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </span>
      </button>

      {isOpen && (
        <ul
          className={`absolute ${widthClass} z-50 mt-1 p-1 bg-white border border-gray-200 rounded-lg shadow-lg text-left`}
          style={dropdownWidth ? { width: dropdownWidth } : undefined}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option.id}
                onClick={() => handleSelectOption(option)}
                className="group text-gray-900 relative cursor-pointer select-none p-2 m-1 rounded border border-transparent transition-colors hover:bg-indigo-50"
              >
                <div className="flex items-center space-x-3">
                  <div className={`${option.type === "llm" ? "bg-blue-100 p-1 rounded" : ""}`}>
                    {getConnectionIcon(option.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">
                      {option.name}
                      <span className="text-xs text-gray-500"> - {getConnectionSubtitle(option)}</span>
                    </h4>
                    <p className="text-xs text-gray-500 group-hover:text-gray-600 truncate">{option.description}</p>
                  </div>
                </div>
                {selectedOption?.id === option.id && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                )}
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-gray-500 text-sm">
              No {filterByType ? `${filterByType} ` : ''}connections available
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default ConnectionSelect;
