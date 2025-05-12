import { type Meta, type StoryObj } from '@storybook/react';

import TextField from './text-field';

const meta = {
  component: TextField,
  title: 'components/Form/TextField',
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'The label of the text field',
    },
    placeholder: {
      control: 'text',
      description: 'The placeholder of the text field',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextField>;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export default meta;
