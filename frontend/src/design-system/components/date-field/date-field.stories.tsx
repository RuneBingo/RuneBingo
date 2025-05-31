import { type Meta, type StoryObj } from '@storybook/react';
import { useState } from 'react';

import DateField from './date-field';

const meta = {
  component: DateField,
  title: 'Design System/Form/DateField',
  args: {
    label: 'Birth Date',
    placeholder: 'Pick a date',
    locale: 'en',
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'The label of the date field',
    },
    placeholder: {
      control: 'text',
      description: 'The placeholder text when no date is selected',
    },
    value: {
      control: 'text',
      description: 'The date value in yyyy-mm-dd format',
    },
    locale: {
      control: 'select',
      options: ['en', 'fr'],
      description: 'The locale for date formatting',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md space-y-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DateField>;

type Story = StoryObj<typeof meta>;

// Playground story component
function PlaygroundComponent(args: React.ComponentProps<typeof DateField>) {
  const [value, setValue] = useState<string | undefined>(args.value);

  return (
    <DateField
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
