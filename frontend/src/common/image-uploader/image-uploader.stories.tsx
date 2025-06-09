import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import type { MediaDto } from '@/api/types';

import ImageUploader from './image-uploader';

const meta: Meta<typeof ImageUploader> = {
  title: 'Common/ImageUploader',
  component: ImageUploader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'object',
      description: 'The current media object',
    },
    onChange: {
      action: 'changed',
      description: 'Callback fired when image is uploaded',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive story with state management
const InteractiveTemplate = () => {
  const [value, setValue] = useState<MediaDto | null>(null);

  return (
    <div className="w-96 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Image Uploader Playground</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload an image to test the component. The aspect ratio will be calculated automatically.
        </p>
      </div>
      <ImageUploader value={value} onChange={setValue} />
      {value && (
        <div className="mt-4 p-3 bg-muted rounded">
          <p className="text-sm font-medium">Current value:</p>
          <p className="text-xs text-muted-foreground break-all">{JSON.stringify(value, null, 2)}</p>
        </div>
      )}
    </div>
  );
};

export const Playground: Story = {
  render: InteractiveTemplate,
};

export const Default: Story = {
  args: {
    value: null,
    onChange: () => {},
  },
  render: (args) => (
    <div className="w-96">
      <ImageUploader value={args.value} onChange={args.onChange} />
    </div>
  ),
};

export const WithExistingImage: Story = {
  args: {
    value: {
      id: '1',
      url: 'https://picsum.photos/400/300',
      originalName: 'sample.jpg',
      size: 12345,
      width: 400,
      height: 300,
      format: 'jpg',
      assetId: 'asset123',
      publicId: 'public123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    onChange: () => {},
  },
  render: (args) => (
    <div className="w-96 h-64">
      <ImageUploader value={args.value} onChange={args.onChange} />
    </div>
  ),
};

export const WithSquareImage: Story = {
  args: {
    value: {
      id: '2',
      url: 'https://picsum.photos/400/400',
      originalName: 'square.jpg',
      size: 23456,
      width: 400,
      height: 400,
      format: 'jpg',
      assetId: 'asset456',
      publicId: 'public456',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    onChange: () => {},
  },
  render: (args) => (
    <div className="w-96 h-96">
      <ImageUploader value={args.value} onChange={args.onChange} />
    </div>
  ),
};

export const WithWideImage: Story = {
  args: {
    value: {
      id: '3',
      url: 'https://picsum.photos/800/300',
      originalName: 'wide.jpg',
      size: 34567,
      width: 800,
      height: 300,
      format: 'jpg',
      assetId: 'asset789',
      publicId: 'public789',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    onChange: () => {},
  },
  render: (args) => (
    <div className="w-96">
      <ImageUploader value={args.value} onChange={args.onChange} />
    </div>
  ),
};
