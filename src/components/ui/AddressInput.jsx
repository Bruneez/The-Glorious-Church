import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, MapPin, SearchX } from 'lucide-react';
import Input from '@/components/ui/Input';
import { isGeoapifyConfigured } from '@/config/geoapify';
import { searchAddressSuggestions } from '@/services/mapService';
import { getGeocodingErrorMessage } from '@/utils/geocodingErrors';

const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 3;

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getHighlightTokens(query) {
  return String(query || '')
    .trim()
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}

function highlightSearchText(text, query) {
  const source = String(text || '');
  const tokens = getHighlightTokens(query);

  if (!source || !tokens.length) {
    return source;
  }

  const pattern = tokens.map((token) => escapeRegExp(token)).join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');

  return source.split(regex).map((part, index) => {
    if (tokens.some((token) => part.toLowerCase() === token.toLowerCase())) {
      return (
        <mark
          key={`${part}-${index}`}
          className="rounded-[3px] bg-indigo-500/30 px-0.5 font-semibold text-indigo-100 not-italic"
        >
          {part}
        </mark>
      );
    }

    return part;
  });
}

export default function AddressInput({
  label,
  name,
  value,
  onChange,
  onAddressSelect,
  latitude = null,
  longitude = null,
  placeholder = 'Street, city, province',
  helperText = '',
  disabled = false,
  fieldError = '',
  showUnverifiedMessage = false,
}) {
  const listId = useId();
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const requestSequenceRef = useRef(0);
  const isMountedRef = useRef(true);

  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState(null);

  const hasCoords = latitude != null && longitude != null && latitude !== '' && longitude !== '';
  const displayError = fieldError || lookupError;
  const query = String(value || '').trim();
  const canSearch = query.length >= MIN_QUERY_LENGTH && isGeoapifyConfigured();

  const updateDropdownPosition = useCallback(() => {
    const inputElement = inputRef.current;
    if (!inputElement) return;

    const rect = inputElement.getBoundingClientRect();
    const viewportPadding = 8;
    const width = Math.min(rect.width, window.innerWidth - viewportPadding * 2);
    const left = Math.max(
      viewportPadding,
      Math.min(rect.left, window.innerWidth - width - viewportPadding),
    );

    setDropdownPosition({
      top: rect.bottom + 6,
      left,
      width,
    });
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!canSearch) {
      setSuggestions([]);
      setIsSearching(false);
      setLookupError('');
      setIsOpen(false);
      setShowEmptyState(false);
      setActiveIndex(-1);
      setDropdownPosition(null);
      return undefined;
    }

    if (!isGeoapifyConfigured()) {
      setLookupError('Address lookup is not configured. Please contact an administrator.');
      return undefined;
    }

    setIsSearching(true);
    setLookupError('');
    setShowEmptyState(false);
    setIsOpen(true);

    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;

    const timeoutId = window.setTimeout(async () => {
      try {
        const results = await searchAddressSuggestions(query);

        if (!isMountedRef.current || requestId !== requestSequenceRef.current) {
          return;
        }

        setSuggestions(results);
        setShowEmptyState(results.length === 0);
        setIsOpen(true);
        setActiveIndex(-1);
      } catch (error) {
        if (!isMountedRef.current || requestId !== requestSequenceRef.current) {
          return;
        }

        setSuggestions([]);
        setShowEmptyState(false);
        setIsOpen(false);
        setLookupError(getGeocodingErrorMessage(error) || 'Address lookup failed. Please try again.');
      } finally {
        if (isMountedRef.current && requestId === requestSequenceRef.current) {
          setIsSearching(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [canSearch, query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current?.contains(event.target)
        || dropdownRef.current?.contains(event.target)
      ) {
        return;
      }

      setIsOpen(false);
      setActiveIndex(-1);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showDropdown = isOpen && canSearch && (isSearching || suggestions.length > 0 || showEmptyState);

  useEffect(() => {
    if (!showDropdown) {
      setDropdownPosition(null);
      return undefined;
    }

    updateDropdownPosition();

    window.addEventListener('resize', updateDropdownPosition);
    document.addEventListener('scroll', updateDropdownPosition, true);

    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      document.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [showDropdown, updateDropdownPosition, suggestions.length, showEmptyState, isSearching]);

  const emitAddressChange = (nextValue) => {
    onChange?.({
      target: {
        name: name || 'address',
        value: nextValue,
      },
    });
  };

  const handleSelectSuggestion = (suggestion) => {
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    setLookupError('');
    setShowEmptyState(false);
    setDropdownPosition(null);

    if (onAddressSelect) {
      onAddressSelect({
        address: suggestion.formattedAddress,
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
      });
      return;
    }

    emitAddressChange(suggestion.formattedAddress);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!isOpen || !suggestions.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      handleSelectSuggestion(suggestions[activeIndex]);
    }
  };

  const dropdownContent = showDropdown && dropdownPosition
    ? createPortal(
      <div
        ref={dropdownRef}
        id={listId}
        role="listbox"
        className="address-dropdown-panel fixed z-[100] custom-scrollbar max-h-[min(16rem,50vh)] overflow-x-hidden overflow-y-auto rounded-xl border border-slate-600/70 bg-slate-900/95 shadow-2xl shadow-black/50 ring-1 ring-white/5 backdrop-blur-md sm:max-h-72"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
        }}
      >
        {isSearching ? (
          <div className="flex items-center gap-3 px-4 py-4 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-indigo-400" aria-hidden="true" />
            <span>Searching addresses…</span>
          </div>
        ) : null}

        {!isSearching && showEmptyState ? (
          <div className="flex items-center gap-3 px-4 py-4 text-sm text-slate-400">
            <SearchX className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            <span>No results found.</span>
          </div>
        ) : null}

        {!isSearching && suggestions.length > 0 ? (
          <ul className="divide-y divide-slate-800/80 py-1.5">
            {suggestions.map((suggestion, index) => (
              <li key={suggestion.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={`flex w-full min-w-0 items-start gap-3 px-3 py-3 text-left transition-colors duration-150 sm:px-4 sm:py-3.5 ${
                    index === activeIndex
                      ? 'bg-indigo-500/15 text-indigo-50'
                      : 'text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ${
                      index === activeIndex
                        ? 'bg-indigo-500/20 text-indigo-300 ring-indigo-500/30'
                        : 'bg-slate-800 text-indigo-400 ring-slate-700/80'
                    }`}
                    aria-hidden="true"
                  >
                    <MapPin className="h-4 w-4" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-sm font-medium leading-snug text-white">
                      {highlightSearchText(suggestion.primaryText, query)}
                    </span>
                    {suggestion.secondaryText ? (
                      <span className="mt-1 block break-words text-xs leading-snug text-slate-400">
                        {highlightSearchText(suggestion.secondaryText, query)}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>,
      document.body,
    )
    : null;

  return (
    <div className="min-w-0 space-y-1.5" ref={containerRef}>
      <Input
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
        error={displayError}
        aria-autocomplete="list"
        aria-controls={showDropdown ? listId : undefined}
        aria-expanded={showDropdown}
        className="min-w-0"
        inputRef={inputRef}
        inputClassName={isSearching ? 'pr-10' : ''}
        trailingIcon={
          isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin text-indigo-400" aria-hidden="true" />
          ) : null
        }
      />

      {dropdownContent}

      {!displayError && hasCoords ? (
        <p className="text-[10px] text-emerald-400">Location coordinates saved</p>
      ) : null}

      {!displayError && !hasCoords && showUnverifiedMessage ? (
        <p className="text-[10px] text-amber-400">
          Address not verified. Select a suggestion or save to look up coordinates.
        </p>
      ) : null}

      {!displayError && !hasCoords && !showUnverifiedMessage && helperText ? (
        <p className="text-[10px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
