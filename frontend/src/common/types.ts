type RouteParams = Record<string, string>;
type QueryParams = { [key: string]: string | string[] | undefined };

export type ServerSideRootProps<TParams extends RouteParams> = {
  children: React.ReactNode;
  params: Promise<TParams>;
  searchParams: Promise<QueryParams>;
};

export type ServerSidePageProps<TParams extends RouteParams> = React.PropsWithChildren<ServerSideRootProps<TParams>>;
