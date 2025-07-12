import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import Pager from './pager';

const meta: Meta<typeof Pager> = {
  title: 'Common/Pager',
  component: Pager,
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
    total: {
      control: { type: 'number', min: 0 },
      description: 'Total number of items',
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
  const total = 100;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-96 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Pager Playground</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Navigate through pages to test the component. Current page: {currentPage + 1} of {Math.ceil(total / limit)}
        </p>
      </div>
      <Pager limit={limit} page={currentPage} total={total} onPageChange={handlePageChange} />
      <div className="mt-4 p-3 bg-muted rounded">
        <p className="text-sm font-medium">Current state:</p>
        <p className="text-xs text-muted-foreground">
          Page: {currentPage + 1}, Offset: {currentPage * limit}, Items: {limit} per page
        </p>
      </div>
    </div>
  );
};

export const Playground: Story = {
  render: InteractiveTemplate,
};

// Story that tests pagerOpen functionality
const PagerOpenTemplate = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pagerOpen, setPagerOpen] = useState(false);
  const limit = 10;
  const total = 100;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-96 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Pager with Open State</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Test the pager with controlled open state. Dropdown open: {pagerOpen ? 'Yes' : 'No'}
        </p>
      </div>
      <Pager
        limit={limit}
        page={currentPage}
        total={total}
        pagerOpen={pagerOpen}
        onPageChange={handlePageChange}
        onPagerOpenChange={setPagerOpen}
      />
      <div className="mt-4 p-3 bg-muted rounded">
        <p className="text-sm font-medium">Current state:</p>
        <p className="text-xs text-muted-foreground">
          Page: {currentPage + 1}, Dropdown Open: {pagerOpen ? 'Yes' : 'No'}
        </p>
      </div>
    </div>
  );
};

export const WithOpenState: Story = {
  render: PagerOpenTemplate,
};

export const Default: Story = {
  args: {
    limit: 10,
    offset: 0,
    total: 100,
    onPageChange: () => {},
  },
};

export const MiddlePage: Story = {
  args: {
    limit: 10,
    offset: 50,
    total: 100,
    onPageChange: () => {},
  },
};

export const LargeDataset: Story = {
  args: {
    limit: 20,
    offset: 200,
    total: 1000,
    onPageChange: () => {},
  },
};
