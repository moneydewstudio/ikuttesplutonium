import { Input } from '@/components/ui/input';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';

type TestInputProps = {
  onInput: (value: string) => void;
  lastInput: string | null;
  lastCorrect: boolean | null;
  inputRef: React.RefObject<HTMLInputElement>;
};

export function TestInput({ onInput, lastInput, lastCorrect, inputRef }: TestInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    console.log(`[TestInput] onChange event fired. e.target.value: "${value}" | Current state inputValue: "${inputValue}"`);

    // Defensively handle if value somehow exceeds maxLength (shouldn't happen)
    if (value.length > 1) {
      console.log(`[TestInput] Value longer than 1 ("${value}"), taking last char.`);
      value = value.slice(-1); // Take only the last character
    }

    // We only want to update state if the result is a single digit
    if (/^[0-9]$/.test(value)) {
      console.log(`[TestInput] Valid digit "${value}". Updating state and calling onInput.`);
      setInputValue(value); // Update state to show the new digit
      onInput(value);     // Notify parent

      // Short delay to show feedback before clearing
      setTimeout(() => {
        setInputValue('');
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }, 150);
    } else {
      // If the input is invalid (e.g. non-numeric), keep it cleared
      console.log(`[TestInput] Invalid value "${value}". Keeping input cleared.`);
      setInputValue('');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  console.log(`[TestInput] Rendering. inputValue state: "${inputValue}" | lastInput prop: "${lastInput}"`);

  return (
    <div className="w-full md:w-1/2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Jawaban:</h3>
        <div className="flex items-center gap-2">
          {lastInput !== null && (
            <>
              <div className="text-sm font-mono">{lastInput}</div>
              {lastCorrect !== null &&
                (lastCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                ))}
            </>
          )}
        </div>
      </div>

      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]"
        maxLength={1}
        value={inputValue}
        className="text-2xl font-mono text-center h-16 bg-white dark:bg-gray-700 text-black dark:text-white"
        onChange={handleInputChange}
        autoFocus
      />
    </div>
  );
}