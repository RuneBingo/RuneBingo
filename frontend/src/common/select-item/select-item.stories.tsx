import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import SelectItem from './select-item';
import { type SelectItemValue } from './types';

const meta: Meta<typeof SelectItem> = {
  title: 'Common/SelectItem',
  component: SelectItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive playground for development
const PlaygroundTemplate = () => {
  const [selectedItems, setSelectedItems] = useState<SelectItemValue[]>([]);

  return (
    <div className="w-96 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">SelectItem Development Playground</h3>
        <p className="text-sm text-muted-foreground mb-4">Develop and test the SelectItem component here.</p>
      </div>
      <SelectItem value={selectedItems} onChange={setSelectedItems} />
      {selectedItems.length > 0 && (
        <div className="mt-4 p-3 bg-muted rounded">
          <p className="text-sm font-medium">Selected items ({selectedItems.length}):</p>
          <pre className="text-xs mt-2 text-muted-foreground">{JSON.stringify(selectedItems, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export const Playground: Story = {
  render: PlaygroundTemplate,
};

export const Default: Story = {
  args: {
    value: [],
    onChange: () => {},
  },
};
