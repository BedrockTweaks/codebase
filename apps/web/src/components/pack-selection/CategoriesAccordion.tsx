import { useCategorySelection, usePackSelectionActions } from '@/contexts';
import { Category, Pack, SEVERITY_COLOR_MAP } from '@/models';
import { Accordion, Box, Grid, Image, Text, useAccordionItemContext, VStack } from '@chakra-ui/react';
import { JSX, ReactNode, useState } from 'react';
import {
  buildCategoryTree,
  CategoryTreeNode,
} from '../../utils/categories';
import { PackItem } from './PackItem';

interface CategoriesAccordionProps {
  categories: Category[];
}

interface CategoryNodeProps {
  node: CategoryTreeNode;
  defaultOpenFirst?: boolean;
  eager?: boolean;
}

function CategoryNodeAccordion({ node, defaultOpenFirst }: CategoryNodeProps): JSX.Element {
  const children = Array.from(node.children.values());
  const defaultValue = defaultOpenFirst && children.length > 0 ? [children[0].fullPath] : undefined;

  return (
    <Accordion.Root collapsible={true} multiple={true} defaultValue={defaultValue}>
      {children.map(childNode => (
        <CategoryNodeItem
          key={childNode.fullPath}
          node={childNode}
          eager={defaultValue?.includes(childNode.fullPath)}
        />
      ))}
    </Accordion.Root>
  );
}

/**
 * Renders its children only once the section has been expanded at least once.
 *
 * Chakra keeps collapsed `Accordion.ItemContent` mounted, so all 520 packs across 28
 * categories were server-rendered for a page that shows one category. Gating on
 * `expanded` cuts the served HTML and the DOM to the open section; the largest
 * category is 58 packs, so rendering on expand is not perceptible.
 *
 * The subtree stays mounted after the first expand, so collapsing and re-opening is
 * instant. `useState(expanded)` seeds from the same value on the server and on the
 * first client render, so hydration matches.
 */
function ExpandedOnce({ children }: { children: ReactNode }): ReactNode {
  const { expanded } = useAccordionItemContext();
  const [hasExpanded, setHasExpanded] = useState(expanded);

  // Derived during render rather than in an effect: the guard makes it converge in one
  // extra render, with no intermediate paint of an empty body.
  if (expanded && !hasExpanded) {
    setHasExpanded(true);
  }

  return hasExpanded ? children : null;
}

interface ToggleAllButtonProps {
  categoryId: string;
}

function ToggleAllButton({ categoryId }: ToggleAllButtonProps): JSX.Element | null {
  const item = useAccordionItemContext();
  const { toggleAll } = usePackSelectionActions();

  const handleToggleAll = (e: React.MouseEvent): void => {
    e.stopPropagation();
    toggleAll(categoryId);
  };

  if (!item.expanded) {
    return null;
  }

  return (
    <Box
      position={'absolute'}
      top={'50%'}
      right={4}
      transform={'translateY(-50%)'}
      display={'flex'}
      alignItems={'center'}
      gap={2}
      cursor={'pointer'}
      onClick={handleToggleAll}
    >
      <Text
        color={'white'}
        fontWeight={'medium'}
        fontSize={'sm'}
      >
        {'Pick All'}
      </Text>

      <Image
        src={'/assets/images/pickle.png'}
        alt={'Toggle all'}
        boxSize={6}
      />
    </Box>

  );
}

interface PackGridProps {
  categoryId: string;
  packs: Pack[];
  eager?: boolean;
}

/**
 * The only subscriber to the selection state in the accordion. It re-renders on every
 * toggle, but it does no styling of its own, and the memoised cards below it skip the
 * re-render unless their own `selected` changed.
 */
function PackGrid({ categoryId, packs, eager }: PackGridProps): JSX.Element {
  const selectedIds = useCategorySelection(categoryId);

  return (
    <Grid
      templateColumns={{
        base: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(4, 1fr)',
        xl: 'repeat(6, 1fr)',
      }}
      gap={2}
      pb={'4'}
    >
      {packs.map(pack => (
        <PackItem
          key={pack.id}
          pack={pack}
          categoryId={categoryId}
          selected={selectedIds?.has(pack.id) ?? false}
          eager={eager}
        />
      ))}
    </Grid>
  );
}

function CategoryNodeItem({ node, eager }: CategoryNodeProps): JSX.Element {
  const children = Array.from(node.children.values());
  const hasPacks = node.category && node.category.packs.length > 0;
  const hasChildren = children.length > 0;
  const hasMessage = node.category?.message;

  return (
    <Accordion.Item value={node.fullPath}>
      <Box position={'relative'}>
        <Accordion.ItemTrigger>
          <Text fontSize={'2xl'} py={'2'}>
            {node.name}
          </Text>
        </Accordion.ItemTrigger>

        {hasPacks && node.category && <ToggleAllButton categoryId={node.category.id} />}
      </Box>

      <Accordion.ItemContent>
        <Accordion.ItemBody pl={4}>
          <ExpandedOnce>
            <VStack align={'stretch'} gap={'4'}>
              {hasMessage && (
                <Box p={3} borderRadius={'xl'} bg={SEVERITY_COLOR_MAP[node.category!.message!.severity]}>
                  <Text color={'white'} fontWeight={'medium'} dangerouslySetInnerHTML={{ __html: node.category!.message!.text }}>
                  </Text>
                </Box>
              )}

              {hasPacks && node.category && (
                <PackGrid
                  categoryId={node.category.id}
                  packs={node.category.packs}
                  eager={eager}
                />
              )}

              {hasChildren && <CategoryNodeAccordion node={node} />}
            </VStack>
          </ExpandedOnce>
        </Accordion.ItemBody>
      </Accordion.ItemContent>
    </Accordion.Item>
  );
}

export function CategoriesAccordion({ categories }: CategoriesAccordionProps): JSX.Element {
  const rootNode = buildCategoryTree(categories);

  return (
    <Box pt={'4'} px={'4'} bg={'gray.700'} borderRadius={'2xl'}>
      <CategoryNodeAccordion node={rootNode} defaultOpenFirst={true} />
    </Box>
  );
}
