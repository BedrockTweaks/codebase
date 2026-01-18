import { Category } from '@/models';

export interface CategoryTreeNode {
  id: string;
  name: string;
  fullPath: string;
  category?: Category;
  children: Map<string, CategoryTreeNode>;
}

/**
 * Builds a tree structure from flat categories with slash-delimited IDs.
 * Example: "aesthetics/hud" becomes nested under "aesthetics"
 */
export function buildCategoryTree(categories: Category[]): CategoryTreeNode {
  const root: CategoryTreeNode = {
    id: 'root',
    name: 'Root',
    fullPath: '',
    children: new Map(),
  };

  for (const category of categories) {
    const pathParts = category.id.split('/');
    let currentNode = root;
    let currentPath = '';

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];

      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!currentNode.children.has(part)) {
        currentNode.children.set(part, {
          id: part,
          name: i === pathParts.length - 1 ? category.name : part,
          fullPath: currentPath,
          children: new Map(),
        });
      }

      currentNode = currentNode.children.get(part)!;

      if (i === pathParts.length - 1) {
        currentNode.category = category;
        currentNode.name = category.name;
      }
    }
  }

  return root;
}
