export interface SelectionIssues {
  /** Category ids that are not in packs.json. */
  unknownCategories: string[];
  /** `categoryId/packId` references that are not in packs.json. */
  unknownPacks: string[];
  /** `categoryId/packId` references that packs.json marks as disabled. */
  disabledPacks: string[];
  /** The request asked for no packs at all. */
  empty: boolean;
}

const buildMessage = (issues: SelectionIssues): string => {
  if (issues.empty) {
    return 'Select at least one pack.';
  }

  const parts: string[] = [];

  if (issues.unknownCategories.length > 0) {
    parts.push(`unknown categories: ${issues.unknownCategories.join(', ')}`);
  }

  if (issues.unknownPacks.length > 0) {
    parts.push(`unknown packs: ${issues.unknownPacks.join(', ')}`);
  }

  if (issues.disabledPacks.length > 0) {
    parts.push(`disabled packs: ${issues.disabledPacks.join(', ')}`);
  }

  return `Your selection is out of date (${parts.join('; ')}). Refresh the page and try again.`;
};

/**
 * Raised when a selection references packs that packs.json does not offer.
 *
 * Assembling anyway would quietly ship a pack missing what the user picked, and
 * cache that result, so every one of these is reported instead of dropped.
 */
export class InvalidSelectionError extends Error {
  readonly issues: SelectionIssues;

  constructor(issues: SelectionIssues) {
    super(buildMessage(issues));

    this.name = 'InvalidSelectionError';
    this.issues = issues;
  }
}
