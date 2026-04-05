import { RuedaSlotAccessModel } from './rueda-slot-access-model';

export interface RuedaAccessModel {
  id: string;
  groupId: string;
  ruedaNumber: number;
  type: 'new' | 'continua';
  loanAmount: number;
  interestRate: number;
  contributionAmount: number;
  installmentAmount: number;
  totalToReturn: number;
  roundingUnit: 500 | 1000;
  startMonth: number;
  startYear: number;
  endMonth: number | null;
  endYear: number | null;
  status: 'pending' | 'active' | 'completed';
  historicalContributionTotal: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  slots?: RuedaSlotAccessModel[];
}
