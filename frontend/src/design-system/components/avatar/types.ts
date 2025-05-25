import { type Avatar } from '@/design-system/ui/avatar';

export type AvatarProps = {
  user: {
    gravatarHash: string | null;
    username: string;
  };
  size?: number;
} & React.ComponentProps<typeof Avatar>;
