import { AvatarFallback, AvatarImage, Avatar as AvatarBase } from '@/design-system/ui/avatar';

import { type AvatarProps } from './types';

export default function Avatar({ user, size = 40, ...props }: AvatarProps) {
  return (
    <AvatarBase style={{ width: size, height: size }} {...props}>
      <AvatarImage
        src={`https://www.gravatar.com/avatar/${user.gravatarHash}?s=${size}&default=robohash`}
        alt={user.username}
      />
      <AvatarFallback>{user.username.slice(0, 1)}</AvatarFallback>
    </AvatarBase>
  );
}
