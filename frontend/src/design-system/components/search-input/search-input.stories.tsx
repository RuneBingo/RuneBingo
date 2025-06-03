import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import SearchInput from './search-input';

const meta: Meta<typeof SearchInput> = {
  title: 'Design System/SearchInput',
  component: SearchInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const PlaygroundTemplate = () => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  return (
    <div className="w-96 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">SearchInput Development Playground</h3>
        <p className="text-sm text-muted-foreground mb-4">Develop and test the SearchInput component here.</p>
      </div>
      <SearchInput
        value={searchValue}
        onChange={handleSearchChange}
        placeholder="Search items..."
        clearable
        debounceSeconds={300}
      />
      <div className="mt-4 p-3 bg-muted rounded">
        <p className="text-sm font-medium">Current search value:</p>
        <p className="text-xs mt-2 text-muted-foreground font-mono">&ldquo;{searchValue}&rdquo;</p>
      </div>
    </div>
  );
};

export const Playground: Story = {
  render: PlaygroundTemplate,
};

export const Default: Story = {
  args: {
    value: '',
    onChange: () => {},
    placeholder: 'Search...',
  },
};
