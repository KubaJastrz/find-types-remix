import type { HeadersFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { useLoaderData, useTransition } from '@remix-run/react';

import type { PackageDataLoaderData } from '~/features/package-data';
import { packageDataLoader } from '~/features/package-data';
import { LoadingResults, PackageSearch, SearchResults } from '~/features/package-search';

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  return {
    'Cache-Control': loaderHeaders.get('Cache-Control') ?? '',
  };
};

export const loader: LoaderFunction = async ({ params }) => {
  const packageName = params['*']!;
  return packageDataLoader(packageName);
};

export const meta: MetaFunction = ({ params }) => {
  const packageName = params['*']!;
  return {
    title: `${packageName} - Find Types`,
  };
};

export default function Package() {
  const packageData = useLoaderData() as PackageDataLoaderData;
  const transition = useTransition();

  const isLoadingPackage =
    transition.state === 'loading' && transition.location.pathname.startsWith('/package');

  return (
    <main className="default-container">
      <PackageSearch initialQuery={packageData.name} />
      {isLoadingPackage ? <LoadingResults /> : <SearchResults packageData={packageData} />}
    </main>
  );
}
