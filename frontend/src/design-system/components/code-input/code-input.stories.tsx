import { type Meta, type StoryObj } from '@storybook/react';

import CodeInput from './code-input';

const meta = {
  component: CodeInput,
  title: 'components/Form/CodeInput',
} satisfies Meta<typeof CodeInput>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};
