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

// Map<categoryId, Set<packId>>
type SelectionState = Map<string, Set<string>>;

export interface PackSelectionActions {
  section: Section;
  togglePack: (categoryId: string, packId: string) => void;
  toggleAll: (categoryId: string) => void;
}

/**
 * Selection state and the actions that change it are separate contexts because a
 * single value forced every consumer to re-render on every toggle: a click re-styled
 * all 58 cards of the open category instead of the one that changed.
 *
 * Actions keep a stable identity for the lifetime of the provider, so components that
 * only dispatch — the pack cards, the "Pick All" control — never re-render on a
 * selection change. Only the grid and the sidebar read the state context.
 */
const PackSelectionActionsContext = createContext<PackSelectionActions | undefined>(undefined);

interface PackSelectionState {
  selection: SelectionState;
  categoryMap: Map<string, Category>;
}

const PackSelectionStateContext = createContext<PackSelectionState | undefined>(undefined);

export function usePackSelectionActions(): PackSelectionActions {
  const ctx = useContext(PackSelectionActionsContext);

  if (!ctx) {
    throw new Error(
      'usePackSelectionActions must be used within PackSelectionProvider',
    );
  }

  return ctx;
}

function usePackSelectionState(): PackSelectionState {
  const ctx = useContext(PackSelectionStateContext);

  if (!ctx) {
    throw new Error(
      'usePackSelectionState must be used within PackSelectionProvider',
    );
  }

  return ctx;
}

/** The set of selected pack ids for one category, or undefined when none are selected. */
export function useCategorySelection(categoryId: string): Set<string> | undefined {
  return usePackSelectionState().selection.get(categoryId);
}

/** The current selection as categories carrying only their selected packs. */
export function useSelectedPacks(): Category[] {
  const { selection, categoryMap } = usePackSelectionState();

  return useMemo<Category[]>(() => Array.from(selection.entries()).map(
    ([categoryId, packIds]) => {
      const category = categoryMap.get(categoryId)!;

      return {
        ...category,
        packs: category.packs.filter(p => packIds.has(p.id)),
      };
    },
  ), [selection, categoryMap]);
}

interface PackSelectionProviderProps {
  section: Section;
  categories: Category[];
  children: ReactNode;
}

export function PackSelectionProvider({ section, categories, children }: PackSelectionProviderProps): JSX.Element {
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

  const toggleAll = useCallback((categoryId: string) => {
    setSelection((prev) => {
      const category = categoryMap.get(categoryId);

      if (!category) {
        return prev;
      }

      const next = new Map(prev);

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

  const actions = useMemo<PackSelectionActions>(
    () => ({ section, togglePack, toggleAll }),
    [section, togglePack, toggleAll],
  );

  const state = useMemo<PackSelectionState>(
    () => ({ selection, categoryMap }),
    [selection, categoryMap],
  );

  return (
    <PackSelectionActionsContext value={actions}>
      <PackSelectionStateContext value={state}>
        {children}
      </PackSelectionStateContext>
    </PackSelectionActionsContext>
  );
}
