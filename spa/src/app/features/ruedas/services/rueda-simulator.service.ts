import { Injectable } from '@angular/core';
import { RuedaSimulatorMonth, RuedaSimulatorRequest, RuedaSimulatorResult } from '../models/rueda-simulator.model';

@Injectable({ providedIn: 'root' })
export class RuedaSimulatorService {
  simulate(request: RuedaSimulatorRequest): RuedaSimulatorResult {
    const participants = Math.max(1, Math.trunc(request.participantsCount));
    const monthsCount = participants;
    const contributionPerPerson = Math.max(0, request.contributionAmount);
    const paymentMode = request.paymentMode;
    const fixedLoanPayment = Math.max(0, request.fixedLoanPayment);

    const previousInstallment = Math.max(0, request.previousInstallmentPerPerson ?? 0);
    const previousActive = Math.max(0, Math.trunc(request.previousActiveCount ?? 0));

    let loanBalance = Math.max(0, request.estimatedLoanAmount);
    let currentCash = Math.max(0, request.openingCash);

    const months: RuedaSimulatorMonth[] = [];
    let totalLoanPaid = 0;
    let totalInterestPaid = 0;
    let totalCollected = 0;

    for (let index = 1; index <= monthsCount; index += 1) {
      const monthLabel = `Mes ${index}`;
      const startingCash = currentCash;

      // previous pool diminishes as participants stop contributing to previous rueda
      const prevPayers = Math.max(0, previousActive - (index - 1));
      const previousPool = prevPayers * previousInstallment;

      const monthlyNewContributions = participants * contributionPerPerson;
      const monthlyCollection = monthlyNewContributions + previousPool;

      const interestCost = Math.round(loanBalance * Math.max(0, request.interestRate) / 100);

      let loanPayment = 0;
      if (loanBalance > 0) {
        if (paymentMode === 'fixed') {
          // prefer using fixedLoanPayment if provided, otherwise use available monthly collection
          const desired = fixedLoanPayment > 0 ? fixedLoanPayment : monthlyCollection;
          loanPayment = Math.min(desired, loanBalance + interestCost);
        } else {
          loanPayment = Math.min(monthlyCollection, loanBalance + interestCost);
        }
      }

      const principalPayment = Math.max(0, loanPayment - interestCost);
      loanBalance = Math.max(0, loanBalance + interestCost - loanPayment);

      const cashFlow = monthlyCollection - loanPayment;
      currentCash = startingCash + cashFlow;

      totalLoanPaid += loanPayment;
      totalInterestPaid += interestCost;
      totalCollected += monthlyCollection;

      months.push({
        position: index,
        monthLabel,
        startingCash,
        monthlyCollection,
        interestCost,
        loanPayment,
        principalPayment,
        cashFlow,
        endingCash: currentCash,
        remainingLoanBalance: loanBalance,
      });
    }

    return {
      months,
      totalCollected,
      totalLoanPaid,
      totalInterestPaid,
      endingCash: currentCash,
      remainingLoanBalance: loanBalance,
      monthlyCollection: months.length > 0 ? months[0].monthlyCollection : 0,
      perPersonPayment: participants > 0 ? (months.length > 0 ? months[0].monthlyCollection / participants : 0) : 0,
    };
  }
}
