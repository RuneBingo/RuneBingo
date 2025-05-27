import { type Meta, type StoryObj } from '@storybook/react';
import { useState } from 'react';

import SwitchField from './switch-field';

const meta = {
  component: SwitchField,
  title: 'components/Form/SwitchField',
  args: {
    label: 'Enable notifications',
    value: false,
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'The label of the switch field',
    },
    value: {
      control: 'boolean',
      description: 'The switch state (checked/unchecked)',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md space-y-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SwitchField>;

type Story = StoryObj<typeof meta>;

// Playground story component with state
function PlaygroundComponent(args: React.ComponentProps<typeof SwitchField>) {
  const [value, setValue] = useState<boolean>(args.value || false);

  return (
    <SwitchField
      {...args}
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
        args.onChange?.(newValue);
      }}
    />
  );
}

export const Playground: Story = {
  render: PlaygroundComponent,
};

export default meta;
