import { SetMetadata } from '@nestjs/common';

export const AllowedCredentials = (...credentials: string[]) => SetMetadata('allowedCredentials', credentials);
export const IsRequired = (isRequired: boolean = false) => SetMetadata('isRequired', isRequired);
