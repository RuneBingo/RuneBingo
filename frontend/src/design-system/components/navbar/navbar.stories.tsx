import { type Meta, type StoryObj } from '@storybook/react';
import { Home, User, Mail } from 'lucide-react';

import { Navbar } from './navbar';

const meta = {
  component: Navbar,
  title: 'components/navbar',
  args: {
    items: [
      { icon: Home, label: 'Home', href: '/' },
      { icon: User, label: 'About', href: '/about' },
      { icon: Mail, label: 'Contact', href: '/contact' },
    ],
    sticky: false,
  },
  argTypes: {
    sticky: {
      control: 'boolean',
      description: 'Makes the navbar stick to the top of the viewport',
    },
  },
  decorators: [
    (Story) => (
      <div className="h-[200vh]">
        <Story />
        <div className="mt-8">
          <p>Scroll down to see sticky behavior when enabled.</p>
          {Array.from({ length: 10 }).map((_, i) => (
            <p key={i}>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Alias libero a repellat suscipit dolores ad,
              laudantium dicta veritatis natus est sint reiciendis voluptate ratione veniam. Recusandae provident
              reprehenderit fugit accusamus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis at rerum
              ipsa. Fugit neque eaque iure! Dolores iste eius reiciendis repellendus. Tempora iure quos enim rem
              voluptatum, tempore delectus non!
            </p>
          ))}
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Navbar>;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Sticky: Story = {
  args: {
    sticky: true,
  },
};

export default meta;
