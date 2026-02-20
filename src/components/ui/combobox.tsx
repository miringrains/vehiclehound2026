"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type ComboboxProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  popularCount?: number;
};

export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  loading = false,
  className,
  popularCount,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);

  const hasGroups = popularCount && popularCount > 0 && options.length > popularCount;
  const popular = hasGroups ? options.slice(0, popularCount) : [];
  const rest = hasGroups ? options.slice(popularCount) : options;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">Loading...</div>
            ) : (
              <>
                <CommandEmpty>{emptyText}</CommandEmpty>
                {hasGroups ? (
                  <>
                    <CommandGroup heading="Popular">
                      {popular.map((option) => (
                        <OptionItem key={option} option={option} value={value} onSelect={(v) => { onValueChange(v); setOpen(false); }} />
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="All">
                      {rest.map((option) => (
                        <OptionItem key={option} option={option} value={value} onSelect={(v) => { onValueChange(v); setOpen(false); }} />
                      ))}
                    </CommandGroup>
                  </>
                ) : (
                  <CommandGroup>
                    {rest.map((option) => (
                      <OptionItem key={option} option={option} value={value} onSelect={(v) => { onValueChange(v); setOpen(false); }} />
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function OptionItem({
  option, value, onSelect,
}: {
  option: string; value: string; onSelect: (v: string) => void;
}) {
  return (
    <CommandItem
      value={option}
      onSelect={(currentValue) => onSelect(currentValue === value ? "" : currentValue)}
    >
      <Check
        className={cn(
          "mr-2 h-4 w-4",
          value?.toLowerCase() === option.toLowerCase() ? "opacity-100" : "opacity-0"
        )}
      />
      {option}
    </CommandItem>
  );
}
