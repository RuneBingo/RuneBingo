import { type Meta, type StoryObj } from '@storybook/react';

import TextAreaField from './text-area-field';

const meta = {
  component: TextAreaField,
  title: 'Design System/Form/TextAreaField',
  args: {
    label: 'Description',
    placeholder: 'Enter your description',
    rows: 4,
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'The label of the text area field',
    },
    placeholder: {
      control: 'text',
      description: 'The placeholder of the text area field',
    },
    rows: {
      control: 'number',
      description: 'The number of visible text lines',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextAreaField>;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export default meta;
