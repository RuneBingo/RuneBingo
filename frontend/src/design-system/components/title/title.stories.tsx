import type { Meta, StoryObj } from '@storybook/react';

import { Title } from '.';

const Lorem = () => (
  <p>
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi modi id adipisci voluptate, culpa quidem molestias
    alias distinctio rem sit maxime quis quod animi, hic doloremque fugit cupiditate, sunt reiciendis?
  </p>
);

const meta = {
  title: 'Design System/Title',
  args: {},
  argTypes: {},
  decorators: [
    () => (
      <div>
        <Title.Primary>Title.Primary</Title.Primary>
        <Lorem />
        <Title.Secondary>Title.Secondary</Title.Secondary>
        <Lorem />
        <Title.Ternary>Title.Ternary</Title.Ternary>
        <Lorem />
        <Title.Quaternary>Title.Quaternary</Title.Quaternary>
        <Lorem />
      </div>
    ),
  ],
} satisfies Meta<typeof Title>;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export default meta;
