import { SetMetadata  } from '@nestjs/common';
import { DatabaseColumns } from '../../utility/enums';

export const Public = () => SetMetadata(DatabaseColumns.IsPublic, true);