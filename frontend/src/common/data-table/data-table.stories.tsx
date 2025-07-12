import { createHash } from 'crypto';

import { faker } from '@faker-js/faker';
import { type StoryObj, type Meta } from '@storybook/react';
import { useQuery } from '@tanstack/react-query';
import { PencilIcon, UserX2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { type OrderBy } from '@/api';
import { type PaginatedDto, Roles, type UserDto } from '@/api/types';
import Avatar from '@/design-system/components/avatar';
import NumberField from '@/design-system/components/number-field';

import DataTable from './data-table';
import { type DataTableActionGroup, type DataTableColumn } from './types';

const rolesHierarchy = [Roles.Admin, Roles.Moderator, Roles.User];

function generateData(count: number): UserDto[] {
  return Array.from({ length: count }).map((_, index) => {
    // 5% chance admin, 10% chance moderator, 85% chance user, force admin if index is 0
    const role = (() => {
      if (index === 0) return Roles.Admin;
      const random = Math.random();
      if (random < 0.05) return Roles.Admin;
      if (random < 0.15) return Roles.Moderator;
      return Roles.User;
    })();

    return {
      username: faker.internet.username(),
      usernameNormalized: faker.internet.username().toLowerCase(),
      language: faker.helpers.arrayElement(['en', 'fr']),
      gravatarHash: createHash('sha256').update(faker.internet.email()).digest('hex'),
      role,
    };
  });
}

const meta: Meta<typeof DataTable> = {
  title: 'Common/DataTable',
  component: DataTable,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

const InteractiveTemplate = () => {
  const [page, setPage] = useState(0);
  const [dataSize, setDataSize] = useState(100);
  const [limit, setLimit] = useState(10);
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [orderBy, setOrderBy] = useState<OrderBy<UserDto>>({
    field: 'username',
    order: 'ASC',
  });

  const [data, setData] = useState<UserDto[]>(generateData(dataSize));
  const [dataKey, setDataKey] = useState(0);

  const handleOrderByFieldChange = (field: keyof UserDto) => {
    if (orderBy.field === field) {
      setOrderBy({ field, order: orderBy.order === 'ASC' ? 'DESC' : 'ASC' });
    } else {
      setOrderBy({ field, order: 'ASC' });
    }
  };

  useEffect(() => {
    setData(generateData(dataSize));
    setDataKey((prev) => prev + 1);
    setPage(0);
  }, [dataSize]);

  const columns: DataTableColumn<UserDto>[] = [
    {
      field: 'username',
      label: 'Username',
      orderable: true,
      render: ({ row, value }) => (
        <div className="flex items-center gap-2">
          <Avatar user={row} />
          <span>{value}</span>
        </div>
      ),
    },
    { field: 'language', label: 'Language', orderable: true },
    { field: 'role', label: 'Role', orderable: true },
  ];

  const actions: DataTableActionGroup<UserDto>[] = [
    [
      {
        label: 'Edit',
        icon: PencilIcon,
        onClick: (item) => alert(`Editing ${item.username}`),
      },
    ],
    [
      {
        label: 'Ban',
        icon: UserX2Icon,
        variant: 'destructive',
        onClick: (item) => alert(`Banning ${item.username}`),
        visible: (item) => item.role !== Roles.Admin,
      },
      {
        label: 'Delete',
        icon: UserX2Icon,
        variant: 'destructive',
        onClick: (item) => alert(`Deleting ${item.username}`),
        visible: (item) => item.role !== Roles.Admin,
      },
    ],
  ];

  const query = useQuery({
    queryKey: ['data-table-story', dataKey, page, limit, orderBy],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));

      let items: UserDto[];

      switch (orderBy.field) {
        case 'language':
          items = data.toSorted((a, b) => a.language.localeCompare(b.language));
          break;
        case 'role':
          items = data.toSorted(
            (a, b) => rolesHierarchy.indexOf(a.role as Roles) - rolesHierarchy.indexOf(b.role as Roles),
          );
          break;
        case 'username':
        default:
          items = data.toSorted((a, b) => a.username.localeCompare(b.username));
          break;
      }

      if (orderBy.order === 'DESC') items = items.toReversed();

      items = items.slice(page * limit, (page + 1) * limit);

      return {
        items,
        total: data.length,
        limit,
        offset: page * limit,
      } as PaginatedDto<UserDto>;
    },
  });

  return (
    <div className="w-full flex flex-col min-h-[500px]">
      <div className="flex items-center gap-2">
        <NumberField label="Data size" value={dataSize} onChange={(value) => setDataSize(Number(value) ?? 0)} />
        <NumberField label="Limit" value={limit} onChange={(value) => setLimit(Number(value) ?? 0)} />
        <NumberField label="Delay" value={delaySeconds} onChange={(value) => setDelaySeconds(Number(value) ?? 0)} />
      </div>
      <DataTable
        query={query}
        actions={actions}
        limit={limit}
        page={page}
        columns={columns}
        orderBy={orderBy}
        idProperty="usernameNormalized"
        blankStateText="No users found"
        blankStateIcon={UserX2Icon}
        onOrderByFieldChange={handleOrderByFieldChange}
        onPageChange={setPage}
      />
    </div>
  );
};

export const Playground: Story = {
  render: InteractiveTemplate,
};
