import { MemberReplacementModel } from './member-replacement-model';
import { MemberReplacementScheduleModel } from './member-replacement-schedule-model';

export class CreateMemberReplacementResult {
  constructor(
    public replacement: MemberReplacementModel,
    public schedule: MemberReplacementScheduleModel[],
    public memberReceives: number,
    public memberPays: number,
  ) {}
}
