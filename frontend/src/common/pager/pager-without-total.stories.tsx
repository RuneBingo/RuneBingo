import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import PagerWithoutTotal from './pager-without-total';

const meta: Meta<typeof PagerWithoutTotal> = {
  title: 'Common/Pager/WithoutTotal',
  component: PagerWithoutTotal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    limit: {
      control: { type: 'number', min: 1 },
      description: 'Number of items per page',
    },
    page: {
      control: { type: 'number', min: 0 },
      description: 'Current page',
    },
    hasPreviousPage: {
      control: 'boolean',
      description: 'Whether there is a previous page available',
    },
    hasNextPage: {
      control: 'boolean',
      description: 'Whether there is a next page available',
    },
    onPageChange: {
      action: 'pageChanged',
      description: 'Callback fired when page changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive story with state management
const InteractiveTemplate = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const limit = 10;
  const totalItems = 50; // Simulate total items for demo
  const hasPreviousPage = currentPage > 0;
  const hasNextPage = currentPage + 1 < totalItems;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="w-96 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">PagerWithoutTotal Playground</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Navigate through pages to test the component. Current page: {currentPage}, Items: {limit} per page
        </p>
      </div>
      <PagerWithoutTotal
        limit={limit}
        page={currentPage}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        onPageChange={handlePageChange}
      />
      <div className="mt-4 p-3 bg-muted rounded">
        <p className="text-sm font-medium">Current state:</p>
        <p className="text-xs text-muted-foreground">
          Page: {currentPage}, Has Previous: {hasPreviousPage ? 'Yes' : 'No'}, Has Next: {hasNextPage ? 'Yes' : 'No'}
        </p>
      </div>
    </div>
  );
};

export const Playground: Story = {
  render: InteractiveTemplate,
};

export const Default: Story = {
  args: {
    limit: 10,
    offset: 0,
    hasPreviousPage: false,
    hasNextPage: true,
    onPageChange: () => {},
  },
};

export const MiddlePage: Story = {
  args: {
    limit: 10,
    offset: 20,
    hasPreviousPage: true,
    hasNextPage: true,
    onPageChange: () => {},
  },
};

export const LastPage: Story = {
  args: {
    limit: 10,
    offset: 40,
    hasPreviousPage: true,
    hasNextPage: false,
    onPageChange: () => {},
  },
};
