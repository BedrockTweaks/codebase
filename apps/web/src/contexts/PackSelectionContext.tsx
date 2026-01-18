import { Category, Section } from '@/models';
import {
  createContext,
  JSX,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export interface PackSelectionContextValue {
  section: Section;
  selectedPacks: Category[];
  togglePack: (categoryId: string, packId: string) => void;
  isSelected: (categoryId: string, packId: string) => boolean;
  toggleAll: (categoryId: string) => void;
}

// Map<categoryId, Set<packId>>
type SelectionState = Map<string, Set<string>>;

const PackSelectionContext = createContext<PackSelectionContextValue | undefined>(undefined);

export function usePackSelection(): PackSelectionContextValue {
  const ctx = useContext(PackSelectionContext);

  if (!ctx) {
    throw new Error(
      'usePackSelection must be used within PackSelectionProvider',
    );
  }

  return ctx;
}

interface PackSelectionProviderProps {
  section: Section;
  categories: Category[];
  children: ReactNode;
}

export function PackSelectionProvider({ section, categories, children }: PackSelectionProviderProps): JSX.Element {
  // Map<categoryId, Set<packId>>
  const [selection, setSelection] = useState<SelectionState>(
    () => new Map(),
  );

  // O(1) category lookup
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  const togglePack = useCallback((categoryId: string, packId: string) => {
    setSelection((prev) => {
      const next = new Map(prev);
      const packSet = new Set(next.get(categoryId) ?? []);

      if (packSet.has(packId)) {
        packSet.delete(packId);
      } else {
        packSet.add(packId);
      }

      if (packSet.size === 0) {
        next.delete(categoryId);
      } else {
        next.set(categoryId, packSet);
      }

      return next;
    });
  }, []);

  const isSelected = useCallback(
    (categoryId: string, packId: string) => selection.get(categoryId)?.has(packId) ?? false,
    [selection],
  );

  const toggleAll = useCallback((categoryId: string) => {
    setSelection((prev) => {
      const next = new Map(prev);
      const category = categoryMap.get(categoryId);

      if (!category) {
        return prev;
      }

      const enabledPackIds = category.packs
        .filter(p => !p.disabled)
        .map(p => p.id);

      const existingSet = next.get(categoryId);

      const allSelected
        = existingSet
          && enabledPackIds.every(id => existingSet.has(id));

      if (allSelected) {
        next.delete(categoryId);
      } else {
        next.set(categoryId, new Set(enabledPackIds));
      }

      return next;
    });
  }, [categoryMap]);

  const selectedPacks = useMemo<Category[]>(() => Array.from(selection.entries()).map(
    ([categoryId, packIds]) => {
      const category = categoryMap.get(categoryId)!;

      return {
        ...category,
        packs: category.packs.filter(p =>
          packIds.has(p.id),
        ),
      };
    },
  ), [selection, categoryMap]);

  const value = useMemo<PackSelectionContextValue>(
    () => ({
      section,
      selectedPacks,
      togglePack,
      isSelected,
      toggleAll,
    }),
    [section, selectedPacks, togglePack, isSelected, toggleAll],
  );

  return (
    <PackSelectionContext value={value}>
      {children}
    </PackSelectionContext>
  );
}
