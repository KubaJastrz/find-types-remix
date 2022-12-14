import type { TypedResponse } from '@remix-run/node';
import { json } from '@remix-run/node';

import { getTypesPackageName } from '~/utils/package';

import type { ErrorResponseData } from './errors';
import { FetchError } from './errors';
import { getPackageData } from './get-package-data';
import type { PackageData } from './types';

export type PackageDataLoaderData =
  | {
      name: string;
      package: PackageData;
      typesPackage: PackageData | ErrorResponseData;
    }
  | {
      name: string;
      error: ErrorResponseData;
    };

type LoaderReturnType = TypedResponse<PackageDataLoaderData>;

export async function packageDataLoader(packageName: string): Promise<LoaderReturnType> {
  let packageData: PackageData;
  let typesPackageData: PackageData | ErrorResponseData;

  try {
    packageData = await getPackageData(packageName);
  } catch (error) {
    if (error instanceof FetchError) {
      return errorJson(error.response.statusCode, {
        name: packageName,
        error: error.response,
      });
    }

    console.error(error);
    const errorData = FetchError.createResponse(500, 'Internal Server Error');
    return errorJson(errorData.statusCode, {
      name: packageName,
      error: errorData,
    });
  }

  try {
    const typesPackageName = getTypesPackageName(packageName);
    typesPackageData = await getPackageData(typesPackageName);
  } catch (error) {
    if (error instanceof FetchError) {
      typesPackageData = error.response;
    } else {
      console.error(error);
      const errorData = FetchError.createResponse(500, 'Internal Server Error');
      return errorJson(errorData.statusCode, {
        name: packageName,
        error: errorData,
      });
    }
  }

  return json(
    {
      name: packageName,
      package: packageData,
      typesPackage: typesPackageData,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    },
  );
}

function errorJson<T>(status: number, data: T) {
  return json(data, { status });
}
