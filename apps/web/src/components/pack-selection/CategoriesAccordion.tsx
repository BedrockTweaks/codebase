import { usePackSelection } from '@/contexts';
import { Category, SEVERITY_COLOR_MAP } from '@/models';
import { Accordion, Box, Grid, Image, Text, useAccordionItemContext, VStack } from '@chakra-ui/react';
import { JSX } from 'react';
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
}

function CategoryNodeAccordion({ node, defaultOpenFirst }: CategoryNodeProps): JSX.Element {
  const children = Array.from(node.children.values());
  const defaultValue = defaultOpenFirst && children.length > 0 ? [children[0].fullPath] : undefined;

  return (
    <Accordion.Root collapsible={true} multiple={true} defaultValue={defaultValue}>
      {children.map(childNode => (
        <CategoryNodeItem key={childNode.fullPath} node={childNode} />
      ))}
    </Accordion.Root>
  );
}

interface ToggleAllButtonProps {
  categoryId: string;
}

function ToggleAllButton({ categoryId }: ToggleAllButtonProps): JSX.Element | null {
  const item = useAccordionItemContext();
  const { toggleAll } = usePackSelection();

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

function CategoryNodeItem({ node }: CategoryNodeProps): JSX.Element {
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
          <VStack align={'stretch'} gap={'4'}>
            {hasMessage && (
              <Box p={3} borderRadius={'xl'} bg={SEVERITY_COLOR_MAP[node.category!.message!.severity]}>
                <Text color={'white'} fontWeight={'medium'} dangerouslySetInnerHTML={{ __html: node.category!.message!.text }}>
                </Text>
              </Box>
            )}

            {hasPacks && node.category && (
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
                {node.category.packs.map(pack => (
                  <PackItem
                    key={pack.id}
                    pack={pack}
                    categoryId={node.category!.id}
                  />
                ))}
              </Grid>
            )}

            {hasChildren && <CategoryNodeAccordion node={node} />}
          </VStack>
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
