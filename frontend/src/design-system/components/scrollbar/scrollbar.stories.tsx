import type { Meta, StoryObj } from '@storybook/react';
import { Fragment } from 'react';

import Scrollbar from './scrollbar';

// Sample content that will overflow
const LongContent = () => (
  <div className="space-y-4">
    {Array.from({ length: 6 }).map((_, index) => (
      <Fragment key={index}>
        <h3 className="text-lg font-semibold">Section {index + 1}</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat.
        </p>
      </Fragment>
    ))}
  </div>
);

const meta = {
  component: Scrollbar,
  title: 'Design System/Scrollbar',
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the scrollbar container',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md h-96 rounded-lg flex">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Scrollbar>;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: 'h-full min-h-0',
  },
  render: (args) => (
    <Scrollbar {...args}>
      <LongContent />
    </Scrollbar>
  ),
};

export const ShortContent: Story = {
  args: {
    className: 'h-full min-h-0',
  },
  render: (args) => (
    <Scrollbar {...args}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Short Content</h3>
        <p>This content is short and will not trigger scrolling.</p>
        <p>Notice that the scrollbar is still available but not visible.</p>
      </div>
    </Scrollbar>
  ),
};

export default meta;
